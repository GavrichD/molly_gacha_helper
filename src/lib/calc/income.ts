import type { IncomeResult, Settings } from "../types";
import { config } from "../config";

// Недельный доход от общаги
export function calculateWeeklyIncome(
  coinsBonusPerRoll: number,
  rollTicketChance: number,   // в процентах
  rerollTicketChance: number, // в процентах
  settings: Settings
): IncomeResult {
  const coinsPerRoll = config.baseCoinsPerRoll + coinsBonusPerRoll;
  const coinsPerWeek = coinsPerRoll * config.freeRollsPerWeek;

  const expectedRollTicketsPerWeek =
    config.freeRollsPerWeek * (rollTicketChance / 100);
  const expectedRerollTicketsPerWeek =
    config.freeRollsPerWeek * (rerollTicketChance / 100);

  return {
    coinsPerWeek,
    expectedRollTicketsPerWeek,
    expectedRerollTicketsPerWeek,
    // Базовую цену берём из config (она константа игры),
    // а старт прогрессии — из счётчика покупок этой недели
    maxRollTicketsIfAllInRoll: calculateMaxTickets(
      coinsPerWeek,
      config.defaultRollTicketPrice,
      settings.rollTicketsPurchased
    ),
    maxRerollTicketsIfAllInReroll: calculateMaxTickets(
      coinsPerWeek,
      config.defaultRerollTicketPrice,
      settings.rerollTicketsPurchased
    ),
  };
}

// Сколько билетов можно купить на сумму, учитывая рост цены +30
function calculateMaxTickets(
  totalCoins: number,
  basePrice: number,
  alreadyPurchased: number
): number {
  let remaining = totalCoins;
  let bought = 0;
  let price = basePrice + alreadyPurchased * config.priceIncreasePerTicket;

  while (remaining >= price) {
    remaining -= price;
    bought += 1;
    price += config.priceIncreasePerTicket;
  }

  return bought;
}