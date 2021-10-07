(async () => {
  await require('del')(['dist/*', '!dist/inversify.*', 'dist/*.map']);
})();
