const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'
  let entry, minimize, output, filename

  if (env && env.minimize) {
    entry = {
      'quill-better-table-plus.min.js': ['./src/quill-better-table-plus.js'],
    }
    minimize = true
    filename = '[name]'
    output = {
      filename,
      library: 'quillBetterTablePlus',
      libraryExport: 'default',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, './dist/'),
    }
  } else if (env && env.format === 'esm') {
    entry = {
      'quill-better-table-plus.esm.js': ['./src/quill-better-table-plus.js'],
    }
    minimize = false
    filename = '[name]'
    output = {
      filename,
      library: 'quillBetterTablePlus',
      libraryTarget: 'umd',
      globalObject: 'this',
      path: path.resolve(__dirname, './dist/'),
    }
  } else if (env && env.format === 'cjs') {
    entry = {
      'quill-better-table-plus.cjs': ['./src/quill-better-table-plus.js'],
    }
    minimize = false
    filename = '[name]'
    output = {
      filename,
      library: 'quillBetterTablePlus',
      libraryTarget: 'commonjs2',
      path: path.resolve(__dirname, './dist/'),
    }
  } else if (env && env.format === 'umd') {
    entry = {
      'quill-better-table-plus.js': ['./src/quill-better-table-plus.js'],
    }
    minimize = false
    filename = '[name]'
    output = {
      filename,
      library: 'quillBetterTablePlus',
      libraryExport: 'default',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, './dist/'),
    }
  } else {
    entry = {
      'quill-better-table-plus.js': ['./src/quill-better-table-plus.js'],
      'quill-better-table-plus': './src/assets/quill-better-table-plus.less',
      'demo/demo.js': './demo/js/demo.js',
    }
    minimize = false
    filename = '[name]'
    output = {
      filename,
      library: 'quillBetterTablePlus',
      libraryExport: 'default',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, './dist/'),
    }
  }

  const config = {
    entry,

    optimization: {
      minimize,
    },

    output,

    resolve: {
      alias: {
        'src': path.resolve(__dirname, './src'),
        'dist': path.resolve(__dirname, './dist'),
      },
      extensions: ['.js', '.less', '.html'],
    },

    externals: {
      'quill': {
        commonjs: 'quill',
        commonjs2: 'quill',
        amd: 'quill',
        root: 'Quill',
      },
    },

    module: {
      rules: [
        {
          test: /\.(jpg|jpeg|png)$/,
          include: [
            path.resolve(__dirname, '../src/assets/imgs'),
          ],
          use: [{
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          }],
        },

        {
          test: /\.(html|svg)$/,
          use: [{
            loader: 'html-loader',
            options: {
              minimize: true,
            },
          }],
        },

        {
          test: /\.less$/,
          use: [
            // fallback to style-loader in development
            !isProduction ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'less-loader',
          ],
        },

        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/env',
                  {
                    targets: {
                      browsers: [
                        'last 2 Chrome major versions',
                        'last 2 Firefox major versions',
                        'last 2 Safari major versions',
                        'last 2 Edge major versions',
                        'last 2 iOS major versions',
                        'last 2 ChromeAndroid major versions',
                      ],
                    },
                  },
                ],
              ],
            },
          },
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        title: 'quill-better-table',
        template: './demo/demo.html',
        filename: 'demo/demo.html',
      }),

      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[name].[id].css',
      }),

      new webpack.HotModuleReplacementPlugin({}),
    ],

    devServer: {
      host: 'localhost',
      contentBase: path.join(__dirname, './dist'),
      port: 8080,
      hot: false,
      open: true,
      openPage: "demo/demo.html",
    },
  }

  return config;
}
