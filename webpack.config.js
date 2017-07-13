var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');

module.exports = {
  context: __dirname,
  devtool: debug ? "inline-sourcemap" : null,
  entry: "./client/app/main.jsx",
  output: {
    path: __dirname + "/client/static",
    filename: "bundle.js"
  },
  module: {
  	loaders: [
  	{
  		test: /\.jsx?$/ ,
  		exclude: /(node_modules|bower_components)/ ,
  		loader: 'babel-loader' ,
  		query: {
  			presets: ['es2017', 'react']
  		}
  	}
  	]
  },
};