// Приближённая формула множителя качества (вариант B).
// Легко заменить на точную, когда появятся данные:
// правим только этот файл.

export function getQualityMultiplier(quality: number): number {
  if (quality <= 1) return 1.2;

  if (quality <= 100) {
    const t = (100 - quality) / 99;
    return 1 + 0.2 * Math.pow(t, 2.48);
  }

  if (quality >= 999) return 0.5;

  const t = (999 - quality) / 899;
  return 0.5 + 0.5 * t;
}

export function isLegendary(rarity: string): boolean {
  return rarity === "legendary";
}

// Применяет качество к базовому значению эффекта.
// У легендарок качество косметическое -> множитель 1.
export function applyQuality(baseValue: number, quality: number, rarity: string): number {
  if (isLegendary(rarity)) return baseValue;
  return baseValue * getQualityMultiplier(quality);
}