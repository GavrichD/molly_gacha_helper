<script lang="ts">
  import { onMount } from 'svelte';
  import TabBar from './components/TabBar.svelte';
  import CatalogTab from './components/CatalogTab.svelte';
  import EconomyTab from './components/EconomyTab.svelte';
  import PassiveTab from './components/PassiveTab.svelte';
  import SettingsTab from './components/SettingsTab.svelte';
  import ImportTab from './components/ImportTab.svelte';
  import { state as appState, loadCatalog } from './lib/state.svelte';

  let tab = $state('economy');

  const SAVE_KEY = 'molly_helper_build_v1';

  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.dorms) appState.dorms = saved.dorms;
      if (saved.settings) appState.settings = { ...appState.settings, ...saved.settings };
      if (typeof saved.maxSlots === 'number') appState.maxSlots = saved.maxSlots;
      if (saved.userCollection) appState.userCollection = saved.userCollection;
      if (saved.userProfile) appState.userProfile = saved.userProfile;
      if (saved.userDorms) appState.userDorms = saved.userDorms;
    }
  } catch {
    // повреждённое сохранение игнорируем
  }

  onMount(() => {
    loadCatalog();
  });

  $effect(() => {
    const snapshot = JSON.stringify({
      dorms: appState.dorms,
      settings: appState.settings,
      maxSlots: appState.maxSlots,
      userCollection: appState.userCollection,
      userProfile: appState.userProfile,
      userDorms: appState.userDorms,
    });
    localStorage.setItem(SAVE_KEY, snapshot);
  });
</script>

<main>
  <h1>Molly Gacha Helper</h1>
  <p class="subtitle">Конструктор общаги и недельного дохода</p>

  <TabBar active={tab} onChange={(t) => (tab = t)} />

  {#if tab === 'catalog'}
    <CatalogTab />
  {:else if tab === 'economy'}
    <EconomyTab target="economy" onGoImport={() => (tab = 'import')} />
  {:else if tab === 'roll'}
    <EconomyTab target="roll" hideSegment={true} onGoImport={() => (tab = 'import')} />
  {:else if tab === 'passive'}
    <PassiveTab />
  {:else if tab === 'settings'}
    <SettingsTab />
  {:else if tab === 'import'}
    <ImportTab />
  {/if}
</main>