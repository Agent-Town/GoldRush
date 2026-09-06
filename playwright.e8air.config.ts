import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

// e8-air-wall-all-maps scratch config: a dev server on the port this implementer owns (5305), so
// the gate never collides with the other lanes sharing this host. `npm run dev` rather than a
// preview build, because these specs runtime-import `/src/*.ts` harnesses that a production
// bundle does not serve (the harness-spec-needs-dev-server lesson). Delete after the drain.
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5305', trace: 'off' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5305 --strictPort',
    url: 'http://127.0.0.1:5305',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
