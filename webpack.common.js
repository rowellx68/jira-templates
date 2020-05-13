const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    'background-script': path.join(__dirname, 'src/background-script.ts'),
    'content-script': path.join(__dirname, 'src/content-script.ts'),
    options: path.join(__dirname, 'src/options/index.tsx'),
    popup: path.join(__dirname, 'src/popup/index.tsx'),
  },
  output: {
    path: path.join(__dirname, 'dist/js'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@src': path.resolve(__dirname, 'src/'),
    },
  },
  optimization: {
    moduleIds: 'hashed',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 19,
          enforce: true,
          minSize: 30000,
        },
        vendorsAsync: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor.async',
          chunks: 'async',
          priority: 9,
          reuseExistingChunk: true,
          minSize: 10000,
        },
        commonsAsync: {
          name: 'commons.async',
          minChunks: 2,
          chunks: 'async',
          priority: 0,
          reuseExistingChunk: true,
          minSize: 10000,
        },
      },
    },
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatters: ['dist/js'],
    }),
  ],
};
