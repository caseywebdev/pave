import isPluralParam from './is-plural-param';
import toKey from './to-key';

export default (params, path) => {
  let keys = [];
  for (let i = 0; i < params.length; ++i) {
    const param = params[i];
    keys.push(toKey(isPluralParam(param) ? param : path[i]));
  }
  return JSON.stringify(keys);
};
