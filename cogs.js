module.exports = {
  pipe: {
    name: 'babel',
    options: {
      presets: ['es2015', 'stage-0']
    }
  },
  builds: {
    'pave.es6': 'pave.js',
    'test.es6': 'test.js'
  }
};
