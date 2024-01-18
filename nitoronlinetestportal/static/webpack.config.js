const path = require('path')
const BundleTracker = require('webpack-bundle-tracker')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const Dotenv = require('dotenv-webpack')

module.exports = {
  /*  mode and devtool added to enable debugging on client side.
  TODO: Need to add webpack.common.js, webpack.dev.js, webpack.prod.js to set the config based on the deployment env.
  */ 
   mode: 'development',
   devtool: 'inline-source-map',
  entry: {
    frontend: './src/index.js',
  },
  output: {
    path: path.resolve('frontend'),
    filename: '[name].js',
    publicPath: 'static/frontend/',
  },
  plugins: [
    new Dotenv(),
    new CleanWebpackPlugin(),
    new BundleTracker({
      filename: './webpack-stats.json',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [{
            loader: 'file-loader',
            options: {}
        }]
    }
    ],
  },
}