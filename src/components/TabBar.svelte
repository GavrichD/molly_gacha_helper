<script lang="ts">
  let { active, onChange }: { active: string; onChange: (tab: string) => void } = $props();

  const tabs = [
    { id: 'catalog', label: 'Каталог' },
    { id: 'economy', label: 'Экономика' },
    { id: 'roll', label: 'Крутки' },
    { id: 'passive', label: 'Пассивные' },
    { id: 'settings', label: 'Настройки' },
    { id: 'import', label: 'Импорт' },
  ];
</script>

<nav class="tabbar">
  {#each tabs as tab}
    <button class:active={active === tab.id} onclick={() => onChange(tab.id)}>
      {tab.label}
    </button>
  {/each}
</nav>