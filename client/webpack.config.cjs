/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

const prod = process.env.NODE_ENV === 'production';

module.exports = {
    entry: './src/index.tsx',
    mode: prod ? 'production' : 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }, {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ],
            },
        ],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'),
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'bundle.css',
        }),
        new Dotenv(),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        port: 3000,
        historyApiFallback: true,
        hot: true
    },
    resolve: {
        fallback: {
            "fs": false,
            "path": require.resolve("path-browserify"),
            "os": require.resolve("os-browserify/browser"),
        }
    }
};