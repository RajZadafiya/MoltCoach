import { useMutation, useQuery, useQueryClient } from 'react-query';
import { clientsApi, extractErrorMessage } from '../api';
import { AddWeightPayload, RangeFilterKey, WeightEntry } from '../interface';
import { calculateWeightStats } from '../utils/conversions';
import { getRangeFromISO } from '../utils/date';
import { QueryKeys } from 'globals';

export function useWeight(clientId: string, range: RangeFilterKey) {
  const queryClient = useQueryClient();
  const fromISO = getRangeFromISO(range);
  const queryKey = [QueryKeys.weight, clientId, range];

  const query = useQuery<WeightEntry[], unknown>(queryKey, () =>
    clientsApi.getClientWeight(clientId, fromISO),
  );

  const sortedEntries: WeightEntry[] = query.data
    ? [...query.data].sort(
        (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime(),
      )
    : [];

  const stats = calculateWeightStats(sortedEntries);

  const addMutation = useMutation<
    WeightEntry,
    unknown,
    AddWeightPayload,
    { previousEntries?: WeightEntry[]; tempId: string }
  >(
    (payload: AddWeightPayload) => clientsApi.addWeightEntry(clientId, payload),
    {
      onMutate: async newEntryPayload => {
        await queryClient.cancelQueries(queryKey);

        const previousEntries =
          queryClient.getQueryData<WeightEntry[]>(queryKey) || [];

        const tempId = `temp_${Date.now()}`;
        const optimisticEntry: WeightEntry = {
          id: tempId,
          clientId,
          dateISO: newEntryPayload.dateISO,
          weightKg: newEntryPayload.weightKg,
          note: newEntryPayload.note ?? null,
          source: 'coach',
          isPending: true, // Marked as pending
        };

        queryClient.setQueryData<WeightEntry[]>(queryKey, [
          optimisticEntry,
          ...previousEntries,
        ]);

        return { previousEntries, tempId };
      },

      onError: (_err, _variables, context) => {
        if (context?.previousEntries) {
          queryClient.setQueryData<WeightEntry[]>(
            queryKey,
            context.previousEntries,
          );
        }
      },

      onSuccess: (serverEntry, _variables, context) => {
        const currentData =
          queryClient.getQueryData<WeightEntry[]>(queryKey) || [];
        const reconciled = currentData.map(item =>
          item.id === context?.tempId ? serverEntry : item,
        );
        queryClient.setQueryData<WeightEntry[]>(queryKey, reconciled);
      },

      onSettled: () => {
        queryClient.invalidateQueries(queryKey);
      },
    },
  );

  const deleteMutation = useMutation<
    void,
    unknown,
    string,
    { previousEntries?: WeightEntry[] }
  >((entryId: string) => clientsApi.deleteWeightEntry(entryId), {
    onMutate: async entryId => {
      await queryClient.cancelQueries(queryKey);
      const previousEntries =
        queryClient.getQueryData<WeightEntry[]>(queryKey) || [];

      queryClient.setQueryData<WeightEntry[]>(
        queryKey,
        previousEntries.filter(item => item.id !== entryId),
      );

      return { previousEntries };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData<WeightEntry[]>(
          queryKey,
          context.previousEntries,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });

  return {
    entries: sortedEntries,
    stats,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isError: query.isError,
    errorMessage: query.error ? extractErrorMessage(query.error) : null,
    refetch: query.refetch,
    addWeight: addMutation.mutateAsync,
    isAdding: addMutation.isLoading,
    deleteWeight: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isLoading,
  };
}
