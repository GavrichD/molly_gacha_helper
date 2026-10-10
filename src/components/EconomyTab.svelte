<script lang="ts">
  import {
    state as appState,
    currentRollPrice,
    currentRerollPrice,
    setRollPrice,
    setRerollPrice,
    resetWeek,
    PRICE_TIERS,
    type DormTarget,
  } from '../lib/state.svelte';
  import CardPool from './CardPool.svelte';
  import { cardEffects } from '../lib/data/cardEffects';
  import { calculateDormBonuses } from '../lib/calc/dorm';
  import { calculateWeeklyIncome } from '../lib/calc/income';
  import { config } from '../lib/config';
  import { fmt } from '../lib/format';
  import CardSlot from './CardSlot.svelte';
  import type { CardInstance } from '../lib/types';

  // Все пропсы в одном вызове $props()
  let {
    target,
    hideSegment = false,
  }: {
    target: DormTarget;
    hideSegment?: boolean;
  } = $props();

  // Внутренний переключатель «Экономика / Тикеты» на вкладке Экономика
  let sub = $state<'economy' | 'roll'>('economy');

  // Для вкладки Крутки hideSegment=true, используем target напрямую;
  // для вкладки Экономика переключаем sub.
  const effectiveTarget = $derived<'economy' | 'roll' | 'passive'>(
    hideSegment ? target : sub
  );

  const slots = $derived(appState.dorms[effectiveTarget]);

  const instances = $derived(
    slots.map((p) => {
      const c = appState.cards.find((x) => x.id === p.cardId);
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

  // Бонусы и доход считаем только для экономической общаги.
  // Для круточной и пассивной — оставим слоты без блока цифр.
  const bonuses = $derived(
    effectiveTarget === 'economy'
      ? calculateDormBonuses(instances, cardEffects)
      : { totalCoinsBonus: 0, rollTicketChance: 0, rerollTicketChance: 0 }
  );

  const income = $derived(
    effectiveTarget === 'economy'
      ? calculateWeeklyIncome(
          bonuses.totalCoinsBonus,
          bonuses.rollTicketChance,
          bonuses.rerollTicketChance,
          appState.settings
        )
      : null
  );
</script>

<section class="panel">
  <h2>{target === 'economy' ? 'Общага' : 'Общага «Крутки»'}</h2>

  {#if !hideSegment}
    <div class="segmented">
      <button class:active={sub === 'economy'} onclick={() => (sub = 'economy')}>Экономика</button>
      <button class:active={sub === 'roll'}    onclick={() => (sub = 'roll')}>Тикеты</button>
    </div>
  {/if}

  <!-- 8 слотов всегда видны -->
  <div class="slots">
    {#each Array(appState.maxSlots) as _, i}
      {@const placed = slots[i]}
      <CardSlot target={effectiveTarget} cardId={placed?.cardId} />
    {/each}
  </div>

  {#if effectiveTarget === 'economy' && income}
    <div class="bottom-grid">
      <!-- Левая колонка: показатели -->
      <div>
        <h3>Показатели</h3>
        <ul class="stats">
          <li>Монет за ролл: {config.baseCoinsPerRoll} + {fmt(bonuses.totalCoinsBonus)} = <strong>{fmt(config.baseCoinsPerRoll + bonuses.totalCoinsBonus)}</strong></li>
          <li>Шанс roll ticket: <strong>{fmt(bonuses.rollTicketChance)}%</strong></li>
          <li>Шанс reroll ticket: <strong>{fmt(bonuses.rerollTicketChance)}%</strong></li>
          <li>Монет в неделю: ≈ <strong>{fmt(Math.round(income.coinsPerWeek), 0)}</strong></li>
          <li>Ожидаемо roll ticket в неделю: ≈ <strong>{fmt(income.expectedRollTicketsPerWeek)}</strong></li>
          <li>Ожидаемо reroll ticket в неделю: ≈ <strong>{fmt(income.expectedRerollTicketsPerWeek)}</strong></li>
        </ul>
        <h3>На что хватит</h3>
        <ul class="stats">
          <li>Если всё в roll ticket: <strong>{income.maxRollTicketsIfAllInRoll} шт.</strong></li>
          <li>Если всё в reroll ticket: <strong>{income.maxRerollTicketsIfAllInReroll} шт.</strong></li>
        </ul>
      </div>

      <!-- Правая колонка: цены -->
      <div>
        <h3>Цены билетов</h3>

        <div class="price-row">
          <label>Цена roll ticket</label>
          <select
            value={currentRollPrice()}
            onchange={(e) => setRollPrice(Number(e.currentTarget.value))}
          >
            {#each PRICE_TIERS as tier}
              <option value={tier.rollPrice}>
                {tier.rollPrice} (куплено {tier.purchased})
              </option>
            {/each}
          </select>
        </div>

        <div class="price-row">
          <label>Куплено roll ticket</label>
          <input
            type="number"
            min="0"
            max="9"
            value={appState.settings.rollTicketsPurchased}
            oninput={(e) => {
              const n = Math.max(0, Math.min(9, Number(e.currentTarget.value) || 0));
              appState.settings.rollTicketsPurchased = n;
            }}
            style="width: 80px"
          />
        </div>

        <div class="price-row">
          <label>Цена reroll ticket</label>
          <select
            value={currentRerollPrice()}
            onchange={(e) => setRerollPrice(Number(e.currentTarget.value))}
          >
            {#each PRICE_TIERS as tier}
              <option value={tier.rerollPrice}>
                {tier.rerollPrice} (куплено {tier.purchased})
              </option>
            {/each}
          </select>
        </div>

        <div class="price-row">
          <label>Куплено reroll ticket</label>
          <input
            type="number"
            min="0"
            max="9"
            value={appState.settings.rerollTicketsPurchased}
            oninput={(e) => {
              const n = Math.max(0, Math.min(9, Number(e.currentTarget.value) || 0));
              appState.settings.rerollTicketsPurchased = n;
            }}
            style="width: 80px"
          />
        </div>

        <p><button class="ghost" onclick={resetWeek}>Сбросить неделю (цены к базовым)</button></p>

        <p class="muted small">
          Поля «цена» и «куплено» связаны: меняешь одно — второе подстраивается.
          Шаг цены: +{config.priceIncreasePerTicket} за каждый купленный билет.
        </p>
      </div>
    </div>
  {/if}
</section>
<CardPool />