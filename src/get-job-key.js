import isPluralParam from './is-plural-param';
import toKey from './to-key';

export default (params, path) => {
  let segments = [];
  for (let i = 0; i < params.length; ++i) {
    const param = params[i];
    segments.push(toKey(isPluralParam(param) ? param : path[i]));
  }
  return JSON.stringify(segments);
};
