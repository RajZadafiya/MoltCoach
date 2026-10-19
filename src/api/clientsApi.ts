/**
 * Clients, Weight, and Girth API endpoints
 */

import { apiClient } from './client';
import {
  AddWeightPayload,
  Client,
  ClientsResponse,
  GirthEntriesResponse,
  GirthSite,
  WeightEntriesResponse,
  WeightEntry,
} from '../interface';
import { routes } from './routes';

export const clientsApi = {
  getClients: async (): Promise<Client[]> => {
    const response = await apiClient.get<ClientsResponse>(routes.clients);
    return response.data.items;
  },

  getClientById: async (clientId: string): Promise<Client> => {
    const response = await apiClient.get<Client>(routes.client(clientId));
    return response.data;
  },

  getClientWeight: async (
    clientId: string,
    from?: string,
    to?: string
  ): Promise<WeightEntry[]> => {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await apiClient.get<WeightEntriesResponse>(
      routes.clientWeight(clientId),
      { params }
    );
    return response.data.items;
  },

  addWeightEntry: async (
    clientId: string,
    payload: AddWeightPayload
  ): Promise<WeightEntry> => {
    const response = await apiClient.post<WeightEntry>(
      routes.clientWeight(clientId),
      payload
    );
    return response.data;
  },

  deleteWeightEntry: async (entryId: string): Promise<void> => {
    await apiClient.delete(routes.deleteWeight(entryId));
  },

  getClientGirth: async (
    clientId: string,
    site?: GirthSite,
    from?: string,
    to?: string
  ): Promise<GirthEntriesResponse['items']> => {
    const params: Record<string, string> = {};
    if (site) params.site = site;
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await apiClient.get<GirthEntriesResponse>(
      routes.clientGirth(clientId),
      { params }
    );
    return response.data.items;
  },
};
