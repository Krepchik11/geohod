module.exports = {
  devServer: {
    proxy: {
      '/events': {
        target: 'http://45.91.92.11',  // Адрес API
        changeOrigin: true, 
        secure: false,  // Для работы с http (если API не использует https)
        pathRewrite: {
          '^/events': '',  
        },
      },
    },
  },
};
