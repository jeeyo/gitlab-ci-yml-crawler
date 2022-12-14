const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  target: 'node',
  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /^(?!.*spec\.tsx?$).*\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        loader: 'node-loader',
        options: {
          name: "[name].[ext]",
        },
      },
    ],
  },

  node: {
    __dirname: false,
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    modules: ['node_modules'],
  },

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
};
