// Подпрограмма разработчика: снимок справочника + заглушки БД эффектов + картинки.
// Запуск из терминала в корне проекта: npm run sync:cards
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const snapshotPath = path.join(root, 'src', 'lib', 'data', 'cardsSnapshot.json');
const effectsPath = path.join(root, 'src', 'lib', 'data', 'cardEffects.json');
const cardsPubDir = path.join(root, 'public', 'cards');

const API = 'https://mollygacha.ru/api/cards';

async function main() {
  console.log('Качаю справочник:', API);
  const res = await fetch(API);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  const cards = data.cards ?? [];
  console.log('Карт в игре:', cards.length);

  // --- 1. снимок справочника ---
  let oldIds = new Set();
  if (existsSync(snapshotPath)) {
    try {
      const old = JSON.parse(readFileSync(snapshotPath, 'utf8'));
      oldIds = new Set((old.cards ?? []).map((c) => c.id));
    } catch { /* повреждённый старый снимок игнорируем */ }
  }
  writeFileSync(snapshotPath, JSON.stringify({ syncedAt: new Date().toISOString(), cards }, null, 2));
  console.log('Снимок записан:', snapshotPath);

  const newCards = cards.filter((c) => !oldIds.has(c.id));
  if (oldIds.size === 0) console.log('\nПервая синхронизация — диффа нет.');
  else if (newCards.length) {
    console.log('\nНовые карты с прошлой синхронизации:');
    for (const c of newCards) console.log(`  #${c.id} ${c.name} (${c.rarity})`);
  } else console.log('\nНовых карт нет.');

  // --- 2. БД эффектов: заглушки только для новых id ---
  let effects = [];
  if (existsSync(effectsPath)) effects = JSON.parse(readFileSync(effectsPath, 'utf8'));
  const known = new Set(effects.map((e) => e.cardId));
  let added = 0;
  for (const c of cards) {
    if (!known.has(c.id)) {
      effects.push({
        cardId: c.id,
        category: 'other',
        effects: [],
        implemented: false,
        notes: `ЗАГЛУШКА: заполнить (${c.name}, ${c.rarity})`,
      });
      added++;
    }
  }
  if (added) {
    writeFileSync(effectsPath, JSON.stringify(effects, null, 2));
    console.log(`\nВ cardEffects.json добавлено заглушек: ${added}`);
  } else console.log('\ncardEffects.json: новых заглушек не нужно.');

  // --- 3. валидация заполненных записей ---
  for (const e of effects) {
    if (!e.implemented) continue;
    for (const ef of e.effects ?? []) {
      if (!Array.isArray(ef.valuesByLevel) || ef.valuesByLevel.length !== 5) {
        console.warn(`ВНИМАНИЕ: cardId ${e.cardId}: valuesByLevel должен содержать 5 чисел (+0..+4)`);
      }
    }
  }

  // --- 4. картинки: превью издания e1 в public/cards ---
  let downloaded = 0, skipped = 0, failed = 0;
  for (const c of cards) {
    const ed = c.editions?.['1'];
    const hash = ed?.image_hash;
    if (!hash) { skipped++; continue; }
    const dir = path.join(cardsPubDir, String(c.id), 'e1', 'art');
    const file = path.join(dir, `preview_default_${hash}.webp`);
    if (existsSync(file)) { skipped++; continue; }
    const url = `https://mollygacha.ru/cards/${c.id}/e1/art/preview_default_${hash}.webp`;
    try {
      const r = await fetch(url);
      if (!r.ok) { failed++; console.warn(`  не скачалось: #${c.id} -> HTTP ${r.status}`); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, buf);
      downloaded++;
    } catch (e) {
      failed++;
      console.warn(`  не скачалось: #${c.id} -> ${e.message}`);
    }
  }
  console.log(`\nКартинки: скачано ${downloaded}, уже было ${skipped}, ошибок ${failed}`);
  console.log('Папка с картинками:', cardsPubDir);

  // --- 5. отчёт по эффектам ---
  const todo = effects.filter((e) => !e.implemented);
  console.log(`\nОсталось заполнить эффектов: ${todo.length} из ${effects.length}`);
  if (todo.length) console.log('id без эффектов:', todo.map((e) => e.cardId).join(', '));
}

main().catch((e) => {
  console.error('Ошибка синхронизации:', e.message);
  process.exit(1);
});