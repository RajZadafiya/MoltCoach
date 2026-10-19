import { useQuery } from 'react-query';
import { clientsApi, extractErrorMessage } from '../api';
import { Client } from '../interface';
import { QueryKeys } from 'globals';

export function useClients() {
  const query = useQuery<Client[], unknown>(
    [QueryKeys.clients],
    clientsApi.getClients,
  );

  const sortedClients = query.data
    ? [...query.data].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return {
    clients: sortedClients,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isError: query.isError,
    errorMessage: query.error ? extractErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
