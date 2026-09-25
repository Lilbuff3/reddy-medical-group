import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://reddymedicalgroupfresno.com',
  output: 'static',
  vite: {
    server: {
      host: true,
      allowedHosts: ['.e2b.app']
    }
  }
});
