// Редкости карт
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

// Категории общаги
export type CardCategory = "economy" | "roll" | "passive" | "other";

// Типы эффектов
export type EffectType =
  | "fixed_coins"          // +N монет за бесплатный ролл
  | "chance_roll_ticket"   // N% шанс roll ticket
  | "chance_reroll_ticket" // N% шанс reroll ticket
  | "special";             // особые эффекты (на будущее)

// Эффект карты
export interface CardEffect {
  type: EffectType;
  valuesByLevel: [number, number, number, number, number]; // [+0, +1, +2, +3, +4]
}

// Особый эффект (заготовка на будущее)
export interface SpecialEffect {
  kind: string;
  condition?: {
    target: string;
    operator: "<" | ">" | "<=" | ">=" | "==";
    value: number;
  };
  valuesByLevel?: [number, number, number, number, number];
  implemented: boolean;
}

// Карта в НАШЕЙ балансной БД (эффекты)
export interface CardData {
  cardId: number; // ссылка на /api/cards -> id
  category: CardCategory;
  effects: CardEffect[];
  special?: SpecialEffect | null;
  implemented: boolean;
  notes?: string;
}

// Копия карты (из API collection)
export interface CardInstance {
  id: number;
  name: string;
  rarity: Rarity;
  upgradeLevel: number; // 0..4
  quality: number;      // 1..999
  instanceId: number;
}

// Настройки калькулятора
export interface Settings {
  rollTicketBasePrice: number;
  rerollTicketBasePrice: number;
  rollTicketsPurchased: number;
  rerollTicketsPurchased: number;
  currentCoins?: number; // пока скрыто из MVP
  userId?: number;
}

// Результат расчёта дохода
export interface IncomeResult {
  coinsPerWeek: number;
  expectedRollTicketsPerWeek: number;
  expectedRerollTicketsPerWeek: number;
  maxRollTicketsIfAllInRoll: number;
  maxRerollTicketsIfAllInReroll: number;
}

// Карточка из справочника игры (/api/cards)
export interface ApiCard {
  id: number;
  name: string;
  rarity: Rarity;
  character_name: string;
  banner_id: number | null;
  banner_name: string | null;
}

// Коллекция пользователя (из API)
export interface UserCollection {
  cardId: number;
  upgradeLevel: number;
  quality: number;
  instanceId: number;
}