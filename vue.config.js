const alias = {
  '@views': '@/views/',
  '@assets': '@/assets',
  '@utils': '@/utils',
};

module.exports = {
  configureWebpack: {
    resolve: {
      alias,
    },
  },
};
