export default (a, b) => {
  if (a == null) a = {};
  for (let key in b) a[key] = b[key];
  return a;
};
