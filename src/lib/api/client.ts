import { config } from '../config';

function buildUrl(path: string): string {
  if (config.useDevProxy && import.meta.env.DEV) {
    return '/api' + path;
  }
  return config.proxyUrl + '/?path=' + encodeURIComponent(path);
}

export async function fetchFromApi<T = any>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path));
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} при запросе ${path}`);
  }
  return (await response.json()) as T;
}

export const getProfile = (userId: number) =>
  fetchFromApi(`/profile?user_id=${userId}`);

export const getCollection = (userId: number) =>
  fetchFromApi(`/collection?user_id=${userId}`);

export const getDormitory = (userId: number, preset: 'default' | 'paid') =>
  fetchFromApi(`/dormitory?user_id=${userId}&preset=${preset}`);

export const getCards = () => fetchFromApi(`/cards`);

// Загрузка всех данных пользователя
export async function loadUserData(userId: number) {
  const [profile, collection, dormDefault, dormPaid] = await Promise.all([
    getProfile(userId),
    getCollection(userId),
    getDormitory(userId, 'default'),
    getDormitory(userId, 'paid'),
  ]);
  
  return {
    profile,
    collection: collection.cards ?? [],
    dorms: {
      economy: (dormDefault.slots ?? []).filter((s: any) => s.card_id).map((s: any) => s.card_id),
      roll: (dormPaid.slots ?? []).filter((s: any) => s.card_id).map((s: any) => s.card_id),
    },
  };
}