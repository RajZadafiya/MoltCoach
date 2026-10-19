import { useQuery } from 'react-query';
import { clientsApi, extractErrorMessage } from '../api';
import { GirthEntry, GirthSite, RangeFilterKey } from '../interface';
import { getRangeFromISO } from '../utils/date';
import { QueryKeys } from 'globals';

export function useGirth(
  clientId: string,
  site: GirthSite,
  range: RangeFilterKey,
) {
  const fromISO = getRangeFromISO(range);
  const queryKey = [QueryKeys.girth, clientId, site, range];

  const query = useQuery<GirthEntry[], unknown>(queryKey, () =>
    clientsApi.getClientGirth(clientId, site, fromISO),
  );

  const sortedEntries: GirthEntry[] = query.data
    ? [...query.data].sort(
        (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime(),
      )
    : [];

  const latestMm = sortedEntries.length > 0 ? sortedEntries[0].valueMm : null;
  const oldestMm =
    sortedEntries.length > 1
      ? sortedEntries[sortedEntries.length - 1].valueMm
      : null;

  const totalChangeMm =
    latestMm !== null && oldestMm !== null ? latestMm - oldestMm : null;

  const entryDeltas = new Map<string, number | null>();
  if (sortedEntries.length === 1) {
    entryDeltas.set(sortedEntries[0].id, null);
  } else if (sortedEntries.length > 1) {
    for (let i = 0; i < sortedEntries.length; i++) {
      const current = sortedEntries[i];
      if (i < sortedEntries.length - 1) {
        const previous = sortedEntries[i + 1];
        entryDeltas.set(current.id, current.valueMm - previous.valueMm);
      } else {
        entryDeltas.set(current.id, null);
      }
    }
  }

  return {
    entries: sortedEntries,
    latestMm,
    totalChangeMm,
    entryDeltas,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isError: query.isError,
    errorMessage: query.error ? extractErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
