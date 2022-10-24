const path = require("path");

module.exports = {
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].meta = {
        viewport: "width=device-width,initial-scale=1,user-scalable=no"
      };
      args[0].title = "dddd";
      args[0].inject = true;
      args[0].filename = "index.html";
      args[0].favicon = "./src/cdn/images/favicon.png"; // path to favicon
      return args;
    });
  },
  configureWebpack: {
    devtool: "cheap-source-map",
    output: {
      filename: "bundle.js"
    }
  },
  //pages: { index: {title: 'My Title', }, } ,
  runtimeCompiler: true,
  devServer: {
    port: 4000
    /*,    proxyTable: {},
      env: require('./dev.env'),
      port: 4545,
      assetsSubDirectory: 'static',
      assetsPublicPath: '/',
      cssSourceMap: false*/
  }, 
  publicPath: process.env.VUE_APP_PUBLIC_PATH
}