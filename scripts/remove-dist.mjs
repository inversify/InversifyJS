// eslint-disable-next-line @typescript-eslint/no-floating-promises
(await import('fs/promises')).rm(new URL('../dist', import.meta.url), { recursive: true, force: true });
