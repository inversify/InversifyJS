const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;

module.exports = {
    mode: 'production',
    context: path.resolve(__dirname, './src'),
    entry: {
        'inversify': './inversify',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './umd'),
        libraryTarget: 'umd',
        library: 'Inversify',
        umdNamedDefine: true,
    },

    devtool: 'source-map',

    resolve: {
        extensions: ['.ts', '.json', '.js'],
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'awesome-typescript-loader',
            },
        ],
    },

    plugins: [
        new CleanWebpackPlugin(),
    ],
};
