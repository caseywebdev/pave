import isObject from './is-object';
import orderObject from './order-object';

export default obj =>
  isObject(obj) ? JSON.stringify(orderObject(obj)) : String(obj);
