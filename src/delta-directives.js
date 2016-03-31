import extend from './extend';
import splice from './splice';

export default {
  $set: (obj, val) => val,

  $merge: (obj, val) => extend(obj, val),

  $apply: (obj, val) => val(obj),

  $splice: (obj, val) => {
    for (let i = 0, l = val.length; i < l; ++i) splice(obj, val[i]);
    return obj;
  },

  $push: (obj, val) => splice(obj, [obj.length, 0].concat(val)),

  $pop: obj => splice(obj, [-1, 1]),

  $unshift: (obj, val) => splice(obj, [0, 0].concat(val)),

  $shift: obj => splice(obj, [0, 1])
};
