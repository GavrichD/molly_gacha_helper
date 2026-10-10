import { config } from './config';
import cardsSnapshot from './data/cardsSnapshot.json';
import type { ApiCard, Settings, UserCollection } from './types';

export interface PlacedCard {
  cardId: number;
  level: number;
  quality: number;
}

export type DormTarget = 'economy' | 'roll' | 'passive';

export const PRICE_TIERS = Array.from({ length: 10 }, (_, i) => ({
  purchased: i,
  rollPrice: config.defaultRollTicketPrice + i * config.priceIncreasePerTicket,
  rerollPrice: config.defaultRerollTicketPrice + i * config.priceIncreasePerTicket,
}));

export const state = $state({
  cards: [] as ApiCard[],
  catalogLoading: false,
  catalogError: '',
  
  // Коллекция пользователя (загружается через импорт)
  userCollection: [] as UserCollection[],
  userProfile: null as any,
  userDorms: {
    economy: [] as number[],
    roll: [] as number[],
  },
  
  dorms: {
    economy: [] as PlacedCard[],
    roll: [] as PlacedCard[],
    passive: [] as PlacedCard[],
  },
  settings: {
    rollTicketsPurchased: 0,
    rerollTicketsPurchased: 0,
  } as Settings,
  maxSlots: 8,
});

export function loadCatalog(): void {
  if (state.cards.length > 0) return;
  state.cards = ((cardsSnapshot as any).cards ?? []) as ApiCard[];
}

export function cardById(id: number): ApiCard | undefined {
  return state.cards.find((c) => c.id === id);
}

// Поиск лучшей копии карты в коллекции пользователя
export function getBestInstance(cardId: number): UserCollection | undefined {
  const copies = state.userCollection.filter((c) => c.cardId === cardId);
  if (copies.length === 0) return undefined;
  
  // Сортируем: макс уровень → мин качество → макс instanceId
  copies.sort((a, b) => {
    if (a.upgradeLevel !== b.upgradeLevel) return b.upgradeLevel - a.upgradeLevel;
    if (a.quality !== b.quality) return a.quality - b.quality;
    return b.instanceId - a.instanceId;
  });
  
  return copies[0];
}

export function isPlacedAnywhere(cardId: number): boolean {
  return (
    state.dorms.economy.some((p) => p.cardId === cardId) ||
    state.dorms.roll.some((p) => p.cardId === cardId) ||
    state.dorms.passive.some((p) => p.cardId === cardId)
  );
}

// Добавление карты с префиллом из коллекции
export function addCard(target: DormTarget, cardId: number): boolean {
  if (state.dorms[target].length >= state.maxSlots) return false;
  if (isPlacedAnywhere(cardId)) return false;
  
  // Префилл: если есть копия в коллекции, берём её уровень и качество
  const best = getBestInstance(cardId);
  const level = best?.upgradeLevel ?? 0;
  const quality = best?.quality ?? 100;
  
  state.dorms[target].push({ cardId, level, quality });
  return true;
}

export function removeCard(target: DormTarget, cardId: number): void {
  state.dorms[target] = state.dorms[target].filter((p) => p.cardId !== cardId);
}

export function currentRollPrice(): number {
  return config.defaultRollTicketPrice +
    state.settings.rollTicketsPurchased * config.priceIncreasePerTicket;
}

export function currentRerollPrice(): number {
  return config.defaultRerollTicketPrice +
    state.settings.rerollTicketsPurchased * config.priceIncreasePerTicket;
}

export function setRollPrice(price: number): void {
  const tier = PRICE_TIERS.find((t) => t.rollPrice === price);
  if (tier) state.settings.rollTicketsPurchased = tier.purchased;
}

export function setRerollPrice(price: number): void {
  const tier = PRICE_TIERS.find((t) => t.rerollPrice === price);
  if (tier) state.settings.rerollTicketsPurchased = tier.purchased;
}

export function resetWeek(): void {
  state.settings.rollTicketsPurchased = 0;
  state.settings.rerollTicketsPurchased = 0;
}

// Заменяет текущую сборку на общагу игрока из игры (с префиллом уровня/качества)
export function applyGameDorms(): { economy: number; roll: number } {
  const build = (ids: number[]) =>
    ids
      .filter((id) => cardById(id) !== undefined)
      .map((id) => {
        const best = getBestInstance(id);
        return {
          cardId: id,
          level: best?.upgradeLevel ?? 0,
          quality: best?.quality ?? 100,
        };
      });
  state.dorms.economy = build(state.userDorms.economy).slice(0, state.maxSlots);
  state.dorms.roll = build(state.userDorms.roll).slice(0, state.maxSlots);
  return { economy: state.dorms.economy.length, roll: state.dorms.roll.length };
}