const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV,

  entry: {
    main: './ui/seznam.cz-2020/',
    winnableGamesGenerator: './ui/seznam.cz-2020/worker/winnableGamesGenerator.ts',
    winnableGamesProvider: './ui/seznam.cz-2020/worker/winnableGamesProvider.ts',
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
            test: /(?:green|red)-s-tile\.svg$/i,
            use: 'file-loader',
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
    new HtmlWebpackPlugin({
      template: './ui/seznam.cz-2020/index.html',
      chunks: ['main'],
    })
  ]
}
