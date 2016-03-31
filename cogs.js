module.exports = {
  pipe: {name: 'babel', options: {presets: ['es2015', 'stage-0']}},
  builds: {'src/**/*': {dir: 'build'}}
};
