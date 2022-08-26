const path = require('path');

module.exports = {
  entry: './src/web_build.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  experiments: {
    outputModule: true,
  },
  output: {
    library: 'tidyscripts_web',
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname),
    filename: 'web_bundle.js'
  },
};
