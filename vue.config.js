module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://45.91.92.11:8080',  // Адрес API
        changeOrigin: true, 
        secure: false,  // Для работы с http 
        pathRewrite: {
          '^/api': '',  
        },
      },
    },
  },
};
