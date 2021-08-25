import path from 'path';
import ts from 'rollup-plugin-typescript2';
import pkg from './package.json';

let hasTSChecked = false;

const outputConfigs = {
  esm: {
    file: pkg.module,
    format: 'es'
  },
  cjs: {
    file: pkg.main,
    format: 'cjs'
  }
};

const packageFormats = Object.keys(outputConfigs);
const packageConfigs = packageFormats.map((format) => createConfig(outputConfigs[format]));

export default packageConfigs;

function createConfig(output, plugins = []) {
  output.exports = 'named';
  output.sourcemap = !!process.env.SOURCE_MAP;
  output.externalLiveBindings = false;

  const shouldEmitDeclarations = pkg.types && !hasTSChecked;

  const tsPlugin = ts({
    check: !hasTSChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations
      },
      exclude: ['test']
    }
  });

  hasTSChecked = true;

  let entryFile = 'src/inversify.ts';
  let external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

  return {
    input: path.resolve(entryFile),
    external,
    plugins: [tsPlugin, ...plugins],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
    treeshake: {
      moduleSideEffects: false
    }
  };
}
