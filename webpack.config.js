const path = require('path');

module.exports = {
  // This is your application's entry point
  entry: './main.ts', 
  mode: "development",

  module: {
    rules: [
      {
        // This rule tells webpack to use ts-loader on all .ts and .tsx files
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.wgsl$/i,
        use: 'raw-loader',
      },
    ],
  },
  resolve: {
    // This tells webpack to automatically resolve extensions
    // This means you can import modules without needing to add their extensions
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    // This is where webpack will output your bundles
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
