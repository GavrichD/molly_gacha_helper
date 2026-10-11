// Модуль прибыльности карт для сортировки пула.
//
// СЕЙЧАС (простая метрика): эффективность карты у игрока =
// значение её эффекта на текущем уровне лучшей копии, с поправкой на качество
// (values уже приходят с поправкой). Группы: roll ticket → reroll ticket → монеты.
//
// ПОТОМ (когда понадобится точная математика, которую мы отложили):
//   - недельный вклад карты: монеты × 14, ожидаемые билеты × 14;
//   - цена билета при стратегиях вложений («всё в roll», «50/50 roll+reroll»);
//   - итоговый score = недельная ценность карты, приведённая к общей шкале
//     (например, билеты пересчитанные в монеты по их цене).
// Достаточно переписать тело profitScore() — сортировка в CardPool не изменится.

export type ProfitInput = {
  effectType: string;
  values: number[]; // значения +0..+4 (уже с поправкой на качество)
  level: number;    // текущий уровень лучшей копии игрока (0..4)
};

const groupOrder: Record<string, number> = {
  chance_roll_ticket: 0,
  chance_reroll_ticket: 1,
  fixed_coins: 2,
};

// Номер группы эффекта: сначала тикеты ролла, потом реролла, потом монеты
export function profitGroup(effectType: string): number {
  return groupOrder[effectType] ?? 3;
}

// Текущая эффективность карты у игрока (чем больше, тем выгоднее)
export function profitScore(input: ProfitInput): number {
  const lvl = Math.max(0, Math.min(4, input.level));
  return input.values[lvl] ?? 0;
}