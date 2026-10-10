import raw from './cardEffects.json';
import type { CardData } from '../types';

// Наша ручная БД эффектов (редактируется в cardEffects.json)
export const cardEffects = raw as unknown as CardData[];

export function getEffect(cardId: number): CardData | undefined {
  return cardEffects.find((e) => e.cardId === cardId);
}