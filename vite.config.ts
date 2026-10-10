import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base нужен только для сборки под GitHub Pages (репозиторий = подпапка).
// В dev-режиме сайт остаётся на корне localhost:5173
export default defineConfig(({ command }) => ({
  plugins: [svelte()],
  base: command === 'build' ? '/molly_gacha_helper/' : '/',
  server: {
    proxy: {
      // локальный обход CORS в dev-режиме
      '/api': {
        target: 'https://mollygacha.ru',
        changeOrigin: true,
        secure: true,
      },
    },
  },
}));