<script lang="ts">
  import { state, cardById, addCard, removeCard, type DormTarget } from '../lib/state.svelte';
  import { cardEffects } from '../lib/data/cardEffects';
  import { applyQuality } from '../lib/data/quality';
  import { rarityLabel, fmt } from '../lib/format';
  import { cardImageUrl } from '../lib/data/images';

  let {
    target,
    cardId,
  }: {
    target: DormTarget;
    cardId: number | undefined;
  } = $props();

  const card = $derived(cardId != null ? cardById(cardId) : undefined);
  const placed = $derived(
    cardId != null ? state.dorms[target].find((p) => p.cardId === cardId) : undefined
  );
  const legendary = $derived(card?.rarity === 'legendary');
  const artUrl = $derived(cardId != null ? cardImageUrl(cardId) : null);

  const availableCards = $derived(
    state.cards.filter((c) => {
      const eff = cardEffects.find((e) => e.cardId === c.id && e.implemented);
      if (!eff) return false;
      if (target === 'economy' && eff.category !== 'economy') return false;
      if (target === 'roll' && eff.category !== 'roll') return false;
      if (target === 'passive' && eff.category !== 'passive') return false;
      if (state.dorms.economy.some((p) => p.cardId === c.id)) return false;
      if (state.dorms.roll.some((p) => p.cardId === c.id)) return false;
      if (state.dorms.passive.some((p) => p.cardId === c.id)) return false;
      return true;
    })
  );

  function onPick(e: Event) {
    const value = Number((e.target as HTMLSelectElement).value);
    if (!value) return;
    addCard(target, value);
    (e.target as HTMLSelectElement).value = '';
  }

  function clampQuality() {
    if (!placed) return;
    placed.quality = Math.max(1, Math.min(999, Number(placed.quality) || 100));
  }

  function contribLines(cardId: number, level: number, quality: number, rarity: string): string[] {
    const data = cardEffects.find((e) => e.cardId === cardId);
    if (!data) return [];
    const clamp = (v: number) => Math.max(0, Math.min(4, v));
    return data.effects.map((ef) => {
      const val = applyQuality(ef.valuesByLevel[clamp(level)], quality, rarity);
      if (ef.type === 'fixed_coins') return `${fmt(val)} монет за 1 бесплатный ролл`;
      if (ef.type === 'chance_roll_ticket') return `${fmt(val)}% шанса получить roll ticket`;
      if (ef.type === 'chance_reroll_ticket') return `${fmt(val)}% шанса получить reroll ticket`;
      return 'особый эффект';
    });
  }
</script>

{#if card && placed && cardId != null}
  <div class="slot">
    <button class="close" title="Убрать из общаги" onclick={() => removeCard(target, cardId)}>×</button>

    <div class="art">
      {#if artUrl}
        <img
          src={artUrl}
          alt=""
          loading="lazy"
          onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      {/if}
    </div>

    <div class="bottom">
      <span class="rarity-badge r-{card.rarity}">{rarityLabel(card.rarity)}</span>
      <div class="name">{card.name}</div>

      <div class="contrib">
        {#each contribLines(placed.cardId, placed.level, placed.quality, card.rarity) as line}
          <div>{line}</div>
        {/each}
      </div>

      <div class="controls">
        <span class="qual-group" title="Качество (1–999)">
          <span class="hash" aria-hidden="true">#</span>
          {#if legendary}
            <span class="qual-dash">—</span>
          {:else}
            <input
              type="number"
              min="1"
              max="999"
              bind:value={placed.quality}
              onchange={clampQuality}
            />
          {/if}
        </span>

        <select title="Уровень" bind:value={placed.level}>
          {#each [0, 1, 2, 3, 4] as lv}
            <option value={lv}>+{lv}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
{:else}
  <div class="slot empty">
    <select onchange={onPick}>
      <option value="">+ выбрать</option>
      {#each availableCards as c}
        <option value={c.id}>{c.name}</option>
      {/each}
    </select>
  </div>
{/if}