<script lang="ts">
  import { state as appState } from '../lib/state.svelte';
  import { loadUserData } from '../lib/api/client';

  let userId = $state(945690716);
  let loading = $state(false);
  let error = $state('');
  let success = $state('');
  let showFallback = $state(false);
  let fallbackJson = $state('');

  // Выносим placeholder в переменную — иначе Svelte парсит фигурные скобки как выражения
  const fallbackPlaceholder = '{"profile": {...}, "collection": [...], "dorms": {...}}';

  async function handleImport() {
    loading = true;
    error = '';
    success = '';
    
    try {
      const data = await loadUserData(userId);
      
      appState.userProfile = data.profile;
      appState.userCollection = data.collection.map((c: any) => ({
        cardId: c.id,
        upgradeLevel: c.upgrade_level,
        quality: c.quality,
        instanceId: c.instance_id,
      }));
      appState.userDorms = data.dorms;
      
      if (data.profile.reroll_tokens !== undefined) {
        appState.settings.rerollTicketsPurchased = 0;
      }
      
      success = `Загружено: ${data.collection.length} копий в коллекции (включая дубликаты), ${data.dorms.economy.length} в экономике, ${data.dorms.roll.length} в крутках`;    } catch (e: any) {
      error = 'Ошибка загрузки: ' + (e?.message ?? String(e));
      showFallback = true;
    } finally {
      loading = false;
    }
  }

  function handleFallbackImport() {
    try {
      const data = JSON.parse(fallbackJson);
      
      if (data.profile) appState.userProfile = data.profile;
      if (data.collection) {
        appState.userCollection = data.collection.map((c: any) => ({
          cardId: c.id,
          upgradeLevel: c.upgrade_level,
          quality: c.quality,
          instanceId: c.instance_id,
        }));
      }
      if (data.dorms) appState.userDorms = data.dorms;
      
      success = 'Данные успешно импортированы из JSON';
      error = '';
    } catch (e: any) {
      error = 'Ошибка парсинга JSON: ' + (e?.message ?? String(e));
    }
  }
</script>

<section class="panel">
  <h2>Импорт данных из игры</h2>
  
  <div class="form-grid">
    <label>
      Telegram ID
      <input type="number" bind:value={userId} />
    </label>
  </div>
  
  <p>
    <button onclick={handleImport} disabled={loading}>
      {loading ? 'Загрузка...' : 'Загрузить данные'}
    </button>
  </p>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  {#if success}
    <div class="success">{success}</div>
  {/if}
  
  {#if showFallback}
    <h3>Fallback: ручная вставка JSON</h3>
    <p class="muted small">
      Если автоматическая загрузка не работает (например, из-за блокировки), 
      откройте игру в Telegram Web, нажмите F12 → Network, обновите страницу, 
      скопируйте JSON-ответы от запросов profile/collection/dormitory и вставьте сюда.
    </p>
    <textarea 
      bind:value={fallbackJson} 
      placeholder={fallbackPlaceholder}
      rows="10"
    ></textarea>
    <p><button onclick={handleFallbackImport}>Импортировать JSON</button></p>
  {/if}
  
  {#if appState.userProfile}
    <h3>Загруженные данные</h3>
    <ul class="stats">
      <li>Имя: {appState.userProfile.name}</li>
      <li>Уровень: {appState.userProfile.level}</li>
      <li>Монеты: {appState.userProfile.coins}</li>
      <li>Реролл-токены: {appState.userProfile.reroll_tokens}</li>
      <li>Карт в коллекции: {appState.userCollection.length}</li>
    </ul>
  {/if}
</section>

<style>
  .success {
    background: #1d3323;
    color: #7cfc9b;
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    margin: 1rem 0;
  }
  
  textarea {
    width: 100%;
    padding: 0.5rem;
    background: #222;
    color: #eee;
    border: 1px solid #444;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.85rem;
    min-height: 120px;
  }
</style>