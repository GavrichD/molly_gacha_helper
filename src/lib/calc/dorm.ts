import type { CardData, CardInstance } from "../types";
import { applyQuality } from "../data/quality";

export interface DormBonuses {
  totalCoinsBonus: number;    // сумма монетных бонусов за ролл
  rollTicketChance: number;   // суммарный % шанса roll ticket
  rerollTicketChance: number; // суммарный % шанса reroll ticket
}

// Считает бонусы набора карт, стоящих в общаге
export function calculateDormBonuses(
  dormCards: CardInstance[],
  effects: CardData[]
): DormBonuses {
  const result: DormBonuses = {
    totalCoinsBonus: 0,
    rollTicketChance: 0,
    rerollTicketChance: 0,
  };

  for (const card of dormCards) {
    const data = effects.find((e) => e.cardId === card.id);
    if (!data || !data.implemented) continue;

    for (const effect of data.effects) {
      const level = Math.max(0, Math.min(card.upgradeLevel, 4));
      const base = effect.valuesByLevel[level];
      const value = applyQuality(base, card.quality, card.rarity);

      if (effect.type === "fixed_coins") result.totalCoinsBonus += value;
      else if (effect.type === "chance_roll_ticket") result.rollTicketChance += value;
      else if (effect.type === "chance_reroll_ticket") result.rerollTicketChance += value;
    }
  }

  return result;
}

// Три "общаги" сборки
export type Dorms = {
  economy: number[];
  roll: number[];
  passive: number[];
};

// Можно ли добавить карту: слоты + запрет быть в двух местах сразу
export function canAddCardToDorm(
  cardId: number,
  target: keyof Dorms,
  dorms: Dorms,
  maxSlots: number
): boolean {
  if (dorms[target].length >= maxSlots) return false;
  const alreadyUsed =
    dorms.economy.includes(cardId) ||
    dorms.roll.includes(cardId) ||
    dorms.passive.includes(cardId);
  return !alreadyUsed;
}