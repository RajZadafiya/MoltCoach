export const routes = {
  login: '/auth/login',
  me: '/me',
  clients: '/clients',
  client: (clientId: string) => `/clients/${clientId}`,
  clientWeight: (clientId: string) => `/clients/${clientId}/weight`,
  deleteWeight: (entryId: string) => `/weight/${entryId}`,
  clientGirth: (clientId: string) => `/clients/${clientId}/girth`,
};
