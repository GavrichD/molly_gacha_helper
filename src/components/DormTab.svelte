<script lang="ts">
  import { state, removeCard, cardById, type DormTarget } from '../lib/state.svelte';
  import { cardEffects } from '../lib/data/cardEffects';
  import { applyQuality } from '../lib/data/quality';
  import { rarityLabel, fmt } from '../lib/format';

  let { target, title }: { target: DormTarget; title: string } = $props();

  const levels = [0, 1, 2, 3, 4];
  const clampLevel = (v: number) => Math.max(0, Math.min(4, v));

  function effectLines(cardId: number, level: number, quality: number, rarity: string): string[] {
    const data = cardEffects.find((e) => e.cardId === cardId);
    if (!data) return ['эффекта пока нет в БД'];
    return data.effects.map((ef) => {
      const base = ef.valuesByLevel[clampLevel(level)];
      const val = applyQuality(base, quality, rarity);
      if (ef.type === 'fixed_coins') return `→ ${fmt(val)} монет за ролл`;
      if (ef.type === 'chance_roll_ticket') return `→ ${fmt(val)}% шанс roll ticket`;
      if (ef.type === 'chance_reroll_ticket') return `→ ${fmt(val)}% шанс reroll ticket`;
      return '→ особый эффект';
    });
  }
</script>

<section class="panel">
  <h2>{title}</h2>
  <p class="muted">Слоты: {state.dorms[target].length} / {state.maxSlots}</p>

  {#if state.dorms[target].length === 0}
    <p class="muted">Пусто. Добавь карты во вкладке «Каталог».</p>
  {/if}

  {#each state.dorms[target] as placed (placed.cardId)}
    {@const card = cardById(placed.cardId)}
    {@const legendary = card?.rarity === 'legendary'}
    <div class="row">
      <div class="row-main">
        <strong>{card?.name ?? 'Карточка #' + placed.cardId}</strong>
        <span class="badge r-{card?.rarity ?? 'common'}">{rarityLabel(card?.rarity ?? 'common')}</span>
        <div class="muted small">
          {#each effectLines(placed.cardId, placed.level, placed.quality, card?.rarity ?? 'common') as line}
            <div>{line}</div>
          {/each}
        </div>
      </div>

      <div class="row-controls">
        <label class="small">Уровень
          <select bind:value={placed.level}>
            {#each levels as lv}
              <option value={lv}>+{lv}</option>
            {/each}
          </select>
        </label>

        {#if legendary}
          <span class="muted small">качество: — (×1)</span>
        {:else}
          <label class="small">Качество (1–999)
            <input type="number" min="1" max="999" bind:value={placed.quality} />
          </label>
        {/if}

        <button class="danger" onclick={() => removeCard(target, placed.cardId)}>Убрать</button>
      </div>
    </div>
  {/each}
</section>