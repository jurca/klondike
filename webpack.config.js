const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV,

  entry: {
    [process.env.ENTRY_NAME]: [process.env.ENTRY_FILE],
  },

  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-modules-typescript-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        oneOf: [
          {
            test: /(?:(?:green|red)-s-tile|game-icons-background)\.svg$/i,
            use: 'url-loader',
          },
          {
            test: /\.svg$/i,
            use: {
              loader:'@svgr/webpack',
              options: {
                svgo: false,
              },
            },
          },
        ]
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  plugins: [
    new webpack.EnvironmentPlugin([
      'NODE_ENV',
    ]),
    ...(process.env.ENTRY_NAME === 'main' ? [
      new HtmlWebpackPlugin({
        template: './ui/seznam.cz-2020/index.html',
        chunks: ['main'],
      })
    ] : []),
  ],

  performance: {
    hints: false,
  },
}
