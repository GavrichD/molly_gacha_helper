<script lang="ts">
  import { state as appState, addCard, isPlacedAnywhere } from '../lib/state.svelte';
  import { cardEffects } from '../lib/data/cardEffects';
  import { rarityLabel, effectSummary } from '../lib/format';

  let search = $state('');
  let rarityFilter = $state<string>('all');
  let onlyWithEffect = $state(false);

  function effectInfo(cardId: number) {
    return cardEffects.find((e) => e.cardId === cardId && e.implemented);
  }

  const filtered = $derived(
    appState.cards.filter((c) => {
      if (rarityFilter !== 'all' && c.rarity !== rarityFilter) return false;
      if (onlyWithEffect && !effectInfo(c.id)) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
  );
</script>

<section class="panel">
  <h2>Каталог карт</h2>

  {#if appState.catalogLoading}<p class="muted">Загрузка справочника…</p>{/if}
  {#if appState.catalogError}<p class="error">{appState.catalogError}</p>{/if}

  <div class="filters">
    <input placeholder="Поиск по названию" bind:value={search} />
    <select bind:value={rarityFilter}>
      <option value="all">Все редкости</option>
      <option value="common">Обычная</option>
      <option value="uncommon">Необычная</option>
      <option value="rare">Редкая</option>
      <option value="epic">Эпическая</option>
      <option value="legendary">Легендарная</option>
    </select>
    <label class="small">
      <input type="checkbox" bind:checked={onlyWithEffect} /> только с эффектом в БД
    </label>
    <span class="muted small">показано: {filtered.length} из {appState.cards.length}</span>
  </div>

  {#each filtered as card (card.id)}
    {@const eff = effectInfo(card.id)}
    {@const placed = isPlacedAnywhere(card.id)}
    <div class="row">
      <div class="row-main">
        <strong>{card.name}</strong>
        <span class="badge r-{card.rarity}">{rarityLabel(card.rarity)}</span>
        <div class="muted small">
          {#if eff}
            {#each eff.effects as e}
              <div>{effectSummary(e)}</div>
            {/each}
          {:else}
            <div>эффекта пока нет в БД</div>
          {/if}
        </div>
      </div>
      <div class="row-controls">
        {#if placed}
          <span class="muted small">уже в сборке</span>
        {:else if eff?.category === 'economy'}
          <button onclick={() => addCard('economy', card.id)}
            disabled={appState.dorms.economy.length >= appState.maxSlots}>
            В экономику
          </button>
        {:else if eff?.category === 'roll'}
          <button onclick={() => addCard('roll', card.id)}
            disabled={appState.dorms.roll.length >= appState.maxSlots}>
            В крутки
          </button>
        {:else if eff?.category === 'passive'}
          <button disabled>Пассивная (позже)</button>
        {:else}
          <button disabled>Недоступно</button>
        {/if}
      </div>
    </div>
  {/each}
</section>