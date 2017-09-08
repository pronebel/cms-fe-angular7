const path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

const _DEV_ = process.env.NODE_ENV === 'development';

const config = {
    entry: {
        'index': path.resolve(__dirname, '../src/index.ts'),
        'polyfills': path.resolve(__dirname, '../src/polyfills.ts'),
        'vendor': path.resolve(__dirname, '../src/vendor.ts'),
        'vendor1': 'ng-zorro-antd',
    },

    output: {
        path: path.resolve(__dirname, '../dist'),
        publicPath: '/',
        sourceMapFilename: '[name].map',
        chunkFilename: '[id].chunk.[chunkhash:8].js',
        filename: './[name].bundle.[chunkhash:8].js'
    },

    devtool: _DEV_?'cheap-module-source-map':false,

    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    'awesome-typescript-loader',
                    'angular2-template-loader',
                    'angular2-router-loader'
                ]
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    minimize: false,
                    removeComments: false,
                    collapseWhitespace: false
                }
            },
            {
                test: /\.less$/,
                loaders: ['raw-loader', 'less-loader']
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [ "css-loader", "less-loader" ]
                })
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [ {loader:"css-loader"} ]
                })
            },
            {
                test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif|mp4|webm)(\?\S*)?$/,
                loader: "url-loader",
                options: {
                    name: "assets/[name]-[hash].[ext]",
                    limit: 2048
                }
            }
        ]
    },

    // plugins
    plugins: [
        new ExtractTextPlugin({ filename: "css/[name].[hash:6].css", allChunks: true }),
        new webpack.NamedModulesPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['common', 'vendor1', 'vendor', 'polyfills'],
            minChunks: 2
        }),
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            path.resolve(__dirname, '../src')
        ),
        new HtmlWebpackPlugin({
            title: 'CMS-FE DEV',
            filename: 'index.html',
            template: 'src/index.html',
        })
    ]
};

module.exports = config;