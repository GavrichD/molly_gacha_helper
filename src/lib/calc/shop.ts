import { config } from "../config";

// Стоимость покупки N билетов подряд (цена растёт на +30 за каждый)
export function calculateTicketCost(
  quantity: number,
  basePrice: number,
  alreadyPurchased: number
): number {
  let total = 0;
  let price = basePrice + alreadyPurchased * config.priceIncreasePerTicket;

  for (let i = 0; i < quantity; i++) {
    total += price;
    price += config.priceIncreasePerTicket;
  }

  return total;
}