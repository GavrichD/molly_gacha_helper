import cardsSnapshot from './cardsSnapshot.json';

type SnapshotCard = {
  id: number;
  editions?: Record<string, { image_hash?: string }>;
};

const snapshotCards: SnapshotCard[] =
  ((cardsSnapshot as any).cards ?? []) as SnapshotCard[];

// Локальное превью: public/cards/{id}/e1/art/preview_default_{hash}.webp
// (скачивается подпрограммой npm run sync:cards)
export function cardImageUrl(cardId: number): string | null {
  const c = snapshotCards.find((x) => x.id === cardId);
  if (!c) return null;
  const ed = c.editions?.['1'] ?? Object.values(c.editions ?? {})[0];
  const hash = ed?.image_hash;
  if (!hash) return null;
  return `${import.meta.env.BASE_URL}cards/${c.id}/e1/art/preview_default_${hash}.webp`;
}