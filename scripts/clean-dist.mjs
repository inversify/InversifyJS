import del from 'del';

(async () => {
  await del(['dist/*', '!dist/inversify.*', 'dist/*.map']);
})();
