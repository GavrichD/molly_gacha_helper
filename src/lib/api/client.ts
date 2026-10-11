import { config } from '../config';

function buildUrl(path: string): string {
  if (config.useDevProxy && import.meta.env.DEV) {
    return '/api' + path;
  }
  return config.proxyUrl + '/?path=' + encodeURIComponent(path);
}

export async function fetchFromApi<T = any>(path: string): Promise<T> {
  const url = buildUrl(path);
  let response: Response;
  try {
    response = await fetch(url);
  } catch (e: any) {
    // сетевой уровень: блокировка провайдером, CORS, отсутствие сети
    throw new Error(`${e?.name ?? 'Ошибка'}: ${e?.message ?? e} | адрес: ${url}`);
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} по адресу ${url}`);
  }
  return (await response.json()) as T;
}

// Пошаговая диагностика: почему не работает импорт
export async function diagnose(userId: number): Promise<string[]> {
  const lines: string[] = [];
  lines.push(`Браузер считает, что онлайн: ${navigator.onLine ? 'да' : 'нет'}`);

  // Шаг 1: доступен ли сам воркер
  try {
    const r = await fetch(config.proxyUrl + '/', { method: 'GET' });
    lines.push(`1. Воркер ${config.proxyUrl}: HTTP ${r.status} — доступен`);
  } catch (e: any) {
    lines.push(`1. Воркер ${config.proxyUrl}: НЕдоступен (${e?.name}: ${e?.message}).`);
    lines.push('   Вероятная причина: провайдер блокирует домен workers.dev');
    lines.push('   (YouTube и cloudflare.com при этом могут работать — это другие домены).');
    lines.push('   Решения: VPN на всё устройство ИЛИ «Ручная вставка JSON» ниже.');
    return lines;
  }

  // Шаг 2: отвечает ли игра через воркер
  try {
    const path = `/profile?user_id=${userId}`;
    const r = await fetch(config.proxyUrl + '/?path=' + encodeURIComponent(path));
    const text = await r.text();
    lines.push(`2. API игры через воркер: HTTP ${r.status}, ответ ${text.length} байт.`);
    if (!r.ok) lines.push('   Тело ответа: ' + text.slice(0, 200));
  } catch (e: any) {
    lines.push(`2. API игры через воркер: ошибка (${e?.name}: ${e?.message}).`);
    lines.push('   Воркер жив, но запрос не прошёл: возможно, игра лежит или сменила адреса.');
  }

  return lines;
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