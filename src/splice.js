import isArray from './is-array';

export default (obj, [start = 0, deleteCount = 0, ...items]) => {
  if (isArray(obj)) {
    obj.splice(start, deleteCount, ...items);
  } else {
    if (obj.length == null) obj.length = 0;
    if (start < 0) start = Math.max(0, obj.length + start);
    const offset = items.length - deleteCount;

    // Delete leading holes.
    for (let i = 0; i < deleteCount; ++i) delete obj[start + i];

    // Shift.
    for (let i = start + items.length; i < obj.length; ++i) {
      obj[i] = obj[i - offset];
    }

    // Replace.
    for (let i = 0, l = items.length; i < l; ++i) obj[start + i] = items[i];

    // Delete trailing holes.
    for (let i = -1; i >= offset; --i) delete obj[obj.length + i];

    obj.length += offset;
  }

  return obj;
};
