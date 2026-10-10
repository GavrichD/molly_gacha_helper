<script lang="ts">
  import { state as appState } from '../lib/state.svelte';

  let message = $state('');
  let pasteText = $state('');

  const pastePlaceholder = '{"dorms": {...}, "settings": {...}, "maxSlots": 8}';

  function buildSave(): string {
    return JSON.stringify(
      {
        version: 1,
        savedAt: new Date().toISOString(),
        dorms: appState.dorms,
        settings: appState.settings,
        maxSlots: appState.maxSlots,
      },
      null,
      2
    );
  }

  function exportFile() {
    const blob = new Blob([buildSave()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'molly-helper-build.json';
    a.click();
    URL.revokeObjectURL(url);
    message = 'Файл molly-helper-build.json сохранён в загрузки';
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(buildSave());
      message = 'Сборка скопирована в буфер обмена';
    } catch (e: any) {
      message = 'Не удалось скопировать: ' + (e?.message ?? String(e));
    }
  }

  function applySave(text: string): string {
    const data = JSON.parse(text);
    if (data.dorms) appState.dorms = data.dorms;
    if (data.settings) appState.settings = { ...appState.settings, ...data.settings };
    if (typeof data.maxSlots === 'number') appState.maxSlots = data.maxSlots;
    return 'Сборка загружена и применена';
  }

  function onFile(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        message = applySave(String(reader.result));
      } catch (err: any) {
        message = 'Ошибка файла: ' + (err?.message ?? String(err));
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  function onPasteImport() {
    try {
      message = applySave(pasteText);
      pasteText = '';
    } catch (err: any) {
      message = 'Ошибка вставки: ' + (err?.message ?? String(err));
    }
  }
</script>

<section class="panel">
  <h2>Сохранение и перенос сборок</h2>
  <p class="muted small">
    Сборка и так автосохраняется в этом браузере. Здесь её можно вынуть файлом или текстом,
    чтобы перенести на другое устройство, отдать другу или загрузить чужую сборку для сравнения.
  </p>

  <p>
    <button onclick={exportFile}>Скачать файлом</button>
    <button class="ghost" onclick={copyToClipboard}>Скопировать текстом</button>
  </p>

  <h3>Загрузить сборку</h3>
  <p><input type="file" accept=".json,application/json" onchange={onFile} /></p>
  <p class="muted small">— или вставь текст сборки:</p>
  <textarea bind:value={pasteText} placeholder={pastePlaceholder} rows="6"></textarea>
  <p><button onclick={onPasteImport}>Загрузить из текста</button></p>

  {#if message}
    <p class="success">{message}</p>
  {/if}
</section>