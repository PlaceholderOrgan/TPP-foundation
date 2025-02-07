const path = require('path');
const webpack = require('webpack');

module.exports = {
  // ... other configurations
  resolve: {
    fallback: {
      "process": require.resolve("process/browser")
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};