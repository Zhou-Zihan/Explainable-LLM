/* eslint-disable */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

// 生产环境才抽离css文件，避免开发环境下修改css后热更新不加载问题
getStyleLoader = () => {
  return process.env.NODE_ENV === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader
}

module.exports = {
  mode: process.env.NODE_ENV,

  entry: './src/index.tsx',

  stats: 'errors-only',

  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html'
    }),
    // new BundleAnalyzerPlugin({analyzerPort: 8080, generateStatsFile: false  })
    new MiniCssExtractPlugin({
      filename: 'css/[name]-[contenthash].css'
    }),
    // new ProgressBarPlugin(),
    // new FriendlyErrorsWebpackPlugin({
    //   compilationSuccessInfo: {
    //     messages: [`You application is running here http://localhost:8080`]
    //   },
    //   onErrors: function (severity, errors) {
    //     // You can listen to errors transformed and prioritized by the plugin
    //     // severity can be 'error' or 'warning'
    //   },
    //   // should the console be cleared between each compilation?
    //   // default is true
    //   clearConsole: true
    // })
  ],

  devtool: 'inline-source-map',

  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    // publicPath: '/',
    clean: true
  },

  devServer: {
    hot: true,
    open: true,
    host: '0.0.0.0',
    port: 8042,
    historyApiFallback: true, //history路由下避免子页面刷新404
    proxy: {
      '/api': {
        // target: 'http://10.76.0.165:8046/',
        target: 'http://localhost:8047/',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    },
    client:{
      overlay: false
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    // extensions: ['.ts', '.tsx', '.js', 'config.js', '.json']
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        enforce: 'pre',
        use: ['babel-loader', 'ts-loader'],
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/
      },
      {
        test: /\.(css|less)$/i,
        use: [
          getStyleLoader(),
          {
            loader: 'css-loader'
            // options: {
            //   modules: {
            //     localIdentName: '[name]__[local]-[hash:base64:5]'
            //   },
            // }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-preset-env']
              }
            }
          },
          'less-loader'
        ]
      },
      {
        test: /\.(csv|tsv)$/i,
        type: 'asset/resource'
      },
      // {
      //   test: /\.xml$/i,
      //   use: ['xml-loader']
      // },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset'
        // parser: {
        //   dataUrlCondition: {
        //     maxSize: 8 * 1024 //小于8kb使用dataUri
        //   }
        // }
      }
    ]
  },

  // resolveLoader: {
  //   modules: ['node_modules', path.resolve(__dirname, 'config')]
  // }

  optimization: {
    // Tree Shaking
    // usedExports: true,
    // //多入口工程配置此项，避免多入个bundle.js重复引用模块
    // runtimeChunk: 'single',
    // 自动拆分 chunks
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

}
