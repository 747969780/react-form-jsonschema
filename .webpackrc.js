module.exports = {
  alias: {
    '@src': `${__dirname}/src`,
    '@less': `${__dirname}/src/less`,
    '@components': `${__dirname}/src/components`,
    '@utils': `${__dirname}/src/utils`,
    '@http': `${__dirname}/src/http`
  },
  extraBabelPlugins: [
    ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": "css" }]
  ]
}
