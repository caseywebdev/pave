export default paths => {
  const mutations = [];
  const reads = [];
  for (let i = 0, l = paths.length; i < l; ++i) {
    const path = paths[i];
    const key = path[0];
    if (typeof key === 'string' && key[key.length - 1] === '!') {
      mutations.push(path);
    } else {
      reads.push(path);
    }
  }
  return {mutations, reads};
};
