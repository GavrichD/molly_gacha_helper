import type { CardEffect, Rarity } from './types';

export const rarityLabels: Record<Rarity, string> = {
  common: 'Обычная',
  uncommon: 'Необычная',
  rare: 'Редкая',
  epic: 'Эпическая',
  legendary: 'Легендарная',
};

export function rarityLabel(rarity: string): string {
  return rarityLabels[rarity as Rarity] ?? rarity;
}

// Число с максимум `digits` знаками после запятой, запятая для вида
export function fmt(n: number, digits = 2): string {
  const rounded = Number(n.toFixed(digits));
  return String(rounded).replace('.', ',');
}

export function effectSummary(effect: CardEffect): string {
  const vals = effect.valuesByLevel.join('/');
  switch (effect.type) {
    case 'fixed_coins':
      return `+${vals} монет`;
    case 'chance_roll_ticket':
      return `${vals}% roll ticket`;
    case 'chance_reroll_ticket':
      return `${vals}% reroll ticket`;
    default:
      return 'особый эффект';
  }
}