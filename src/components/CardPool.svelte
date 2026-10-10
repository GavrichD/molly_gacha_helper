<script lang="ts">
  import {
    state as appState,
    cardById,
    addCard,
    removeCard,
    isPlacedAnywhere,
    getBestInstance,
  } from '../lib/state.svelte';
  import { cardEffects } from '../lib/data/cardEffects';
  import { getQualityMultiplier } from '../lib/data/quality';
  import { rarityLabel } from '../lib/format';
  import { cardImageUrl } from '../lib/data/images';
  import type { Rarity } from '../lib/types';

  let bannerFilter = $state<string>('all');
  let rarityFilter = $state<string>('all');

  const rarityOrder: Record<Rarity, number> = {
    legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4,
  };

  const dots = [
    { r: 'common', color: '#7cfc9b' },
    { r: 'uncommon', color: '#7cb8fc' },
    { r: 'rare', color: '#d29afc' },
    { r: 'epic', color: '#fc7c7c' },
    { r: 'legendary', color: '#f2f2f2' },
  ];

  const banners = $derived(
    Array.from(new Set(appState.cards.map((c) => c.banner_name).filter((b): b is string => !!b)))
  );

  interface PoolItem {
    id: number;
    name: string;
    rarity: Rarity;
    category: 'economy' | 'roll';
    owned: boolean;
    level: number;
    quality: number;
    values: number[];
    placed: boolean;
    artUrl: string | null;
  }

  const items = $derived<PoolItem[]>(
    appState.cards
      .map((c) => {
        const eff = cardEffects.find((e) => e.cardId === c.id && e.implemented);
        if (!eff) return null;
        if (eff.category !== 'economy' && eff.category !== 'roll') return null;
        const best = getBestInstance(c.id);
        const owned = !!best;
        const quality = best?.quality ?? 100;
        const mult = getQualityMultiplier(quality);
        const first = eff.effects[0];
        const values = first
          ? first.valuesByLevel.map((v) => (c.rarity === 'legendary' ? v : v * mult))
          : [];
        return {
          id: c.id,
          name: c.name,
          rarity: c.rarity,
          category: eff.category as 'economy' | 'roll',
          owned,
          level: best?.upgradeLevel ?? 0,
          quality,
          values,
          placed: isPlacedAnywhere(c.id),
          artUrl: cardImageUrl(c.id),
        };
      })
      .filter((x): x is PoolItem => x !== null)
      .filter((x) => bannerFilter === 'all' || cardById(x.id)?.banner_name === bannerFilter)
      .filter((x) => rarityFilter === 'all' || x.rarity === rarityFilter)
      .sort((a, b) => {
        if (a.owned !== b.owned) return a.owned ? -1 : 1;
        if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
          return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        }
        return a.name.localeCompare(b.name, 'ru');
      })
  );

  function toggle(item: PoolItem) {
    if (item.placed) {
      removeCard('economy', item.id);
      removeCard('roll', item.id);
      removeCard('passive', item.id);
    } else {
      addCard(item.category, item.id);
    }
  }

  function numClass(item: PoolItem, i: number): string {
    if (!item.owned) return 'n-gray';
    if (i < item.level) return 'n-done';
    if (i === item.level) return 'n-current';
    return 'n-gray';
  }
</script>

<section class="panel">
  <div class="pool-filters">
    <select class="banner-select" bind:value={bannerFilter}>
      <option value="all">Все баннеры</option>
      {#each banners as b}
        <option value={b}>{b}</option>
      {/each}
    </select>

    <div class="dots">
      <label class="dot-item" class:active={rarityFilter === 'all'}>
        <input type="radio" name="pool-rarity" value="all" bind:group={rarityFilter} />
        <span class="dot-text">Все</span>
      </label>
      {#each dots as d}
        <label class="dot-item" class:active={rarityFilter === d.r}>
          <input type="radio" name="pool-rarity" value={d.r} bind:group={rarityFilter} />
          <span class="dot" style="background: {d.color}"></span>
        </label>
      {/each}
    </div>
  </div>

  <div class="pool-grid">
    {#each items as item (item.id)}
      <button
        class="pool-card"
        class:missing={!item.owned}
        class:placed={item.placed}
        onclick={() => toggle(item)}
        title={item.placed ? 'Убрать из общаги' : 'Добавить в общагу'}
      >
        <span class="rarity-badge r-{item.rarity}">{rarityLabel(item.rarity)}</span>

        <div class="art">
          {#if item.artUrl}
            <img
              src={item.artUrl}
              alt=""
              loading="lazy"
              onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          {/if}
        </div>

        <div class="name">{item.name}</div>

        <div class="nums">
          <span class="star">*</span>
          {#each item.values as v, i}
            <span class={numClass(item, i)}>{Math.round(v)}</span>
          {/each}
        </div>

        <div class="pool-bottom">
          <span>#{item.owned ? item.quality : '—'}</span>
          <span>{item.owned ? '+' + item.level : 'нет'}</span>
        </div>
      </button>
    {/each}
  </div>
</section>