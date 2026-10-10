<script lang="ts">
  import { state, cardById } from '../lib/state.svelte';
  import { cardEffects } from '../lib/data/cardEffects';
  import { calculateDormBonuses } from '../lib/calc/dorm';
  import { calculateWeeklyIncome } from '../lib/calc/income';
  import { config } from '../lib/config';
  import { fmt } from '../lib/format';
  import type { CardInstance } from '../lib/types';

  const instances = $derived(
    state.dorms.economy.map((p) => {
      const c = cardById(p.cardId);
      return {
        id: p.cardId,
        name: c?.name ?? '?',
        rarity: c?.rarity ?? 'common',
        upgradeLevel: p.level,
        quality: p.quality,
        instanceId: 0,
      } as CardInstance;
    })
  );

  const bonuses = $derived(calculateDormBonuses(instances, cardEffects));

  const income = $derived(
    calculateWeeklyIncome(
      bonuses.totalCoinsBonus,
      bonuses.rollTicketChance,
      bonuses.rerollTicketChance,
      state.settings
    )
  );

  const nextRollPrice = $derived(
    state.settings.rollTicketBasePrice +
      state.settings.rollTicketsPurchased * config.priceIncreasePerTicket
  );
  const nextRerollPrice = $derived(
    state.settings.rerollTicketBasePrice +
      state.settings.rerollTicketsPurchased * config.priceIncreasePerTicket
  );
</script>

<section class="panel">
  <h2>Доход за неделю</h2>
  <p class="muted">Сейчас учитывается только экономическая общага. Крутки и пассивные — позже.</p>

  <h3>Бонусы экономической общаги</h3>
  <ul class="stats">
    <li>Монет за бесплатный ролл: {config.baseCoinsPerRoll} + {fmt(bonuses.totalCoinsBonus)} =
      <strong>{fmt(config.baseCoinsPerRoll + bonuses.totalCoinsBonus)}</strong></li>
    <li>Шанс roll ticket: <strong>{fmt(bonuses.rollTicketChance)}%</strong></li>
    <li>Шанс reroll ticket: <strong>{fmt(bonuses.rerollTicketChance)}%</strong></li>
  </ul>

  <h3>За неделю ({config.freeRollsPerWeek} бесплатных роллов)</h3>
  <ul class="stats">
    <li>Монет: ≈ <strong>{fmt(Math.round(income.coinsPerWeek), 0)}</strong></li>
    <li>Ожидаемо roll ticket с общаги: ≈ <strong>{fmt(income.expectedRollTicketsPerWeek)}</strong></li>
    <li>Ожидаемо reroll ticket с общаги: ≈ <strong>{fmt(income.expectedRerollTicketsPerWeek)}</strong></li>
  </ul>

  <h3>Магазин при текущих ценах</h3>
  <ul class="stats">
    <li>Если все монеты в roll ticket: <strong>{income.maxRollTicketsIfAllInRoll} шт.</strong></li>
    <li>Если все монеты в reroll ticket: <strong>{income.maxRerollTicketsIfAllInReroll} шт.</strong></li>
    <li class="muted small">
      Цена следующего roll ticket: {nextRollPrice}; следующего reroll ticket: {nextRerollPrice}
    </li>
  </ul>
</section>