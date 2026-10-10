// Глобальные константы и настройки транспорта
export const config = {
  // Адрес Cloudflare Worker (продакшен-транспорт)
  proxyUrl: "https://molly-proxy.daniel-g2005.workers.dev",

  // В dev-режиме ходить через локальный прокси Vite (см. vite.config.ts)
  useDevProxy: true,

  // Игровые константы
  freeRollsPerDay: 2,
  freeRollsPerWeek: 14,
  baseCoinsPerRoll: 25,

  // Магазин
  defaultRollTicketPrice: 155,
  defaultRerollTicketPrice: 125,
  priceIncreasePerTicket: 30,

  // Общага
  maxDormSlots: 8,
};