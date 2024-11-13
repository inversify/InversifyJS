// ts-check

import path from 'node:path';

const outputPath = path.resolve(import.meta.dirname, 'es');

/** @type {!import("webpack").Configuration} */
export default {
  devtool: 'inline-source-map',
  entry: './src/inversify.ts',
  experiments: {
    outputModule: true,
  },
  externals: [/@inversifyjs\/.+/],
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'src/tsconfig-es.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'inversify.js',
    library: {
      type: 'module',
    },
    path: outputPath,
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  stats: 'verbose',
};
