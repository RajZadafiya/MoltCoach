/**
 * @format
 */
const QueryKeys = {
  clients: 'clients',
  weight: 'weight',
  girth: 'girth',
  me: 'me',
} as const;

export type QueryKeysType = keyof typeof QueryKeys;

export { QueryKeys };
