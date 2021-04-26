// @ts-check
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

/** @type {import('webpack').ConfigurationFactory} */
const config = (env) => {
  const isProduction =
    typeof env === "string"
      ? env === "production"
      : env.production ?? process.env.NODE_ENV === "production";

  return {
    entry: "./src/index.tsx",
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
    },
    target: "web",
    // @ts-ignore
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].bundle.css",
        chunkFilename: "[id].css",
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "./index.ejs"),
      }),
      !isProduction && new webpack.HotModuleReplacementPlugin(),
      !isProduction && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    mode: isProduction ? "production" : "development",
    devtool: !isProduction ? "inline-source-map" : "source-map",
    devServer: !isProduction
      ? {
          contentBase: path.resolve(__dirname, "dist"),
          compress: true,
          historyApiFallback: true,
          hot: true,
        }
      : undefined,
    module: {
      rules: [
        {
          test: /\.tsx?$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                plugins: [
                  !isProduction && require.resolve("react-refresh/babel"),
                ].filter(Boolean),
              },
            },
          ].filter(Boolean),
        },
        {
          test: /\.svg$/i,
          exclude: /node_modules/,
          use: [{ loader: "file-loader" }],
        },
        {
          test: /\.css$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {},
            },
            { loader: "css-loader", options: { importLoaders: 1 } },
            { loader: "postcss-loader" },
          ],
        },
      ],
    },
  };
};

module.exports = config;
