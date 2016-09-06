import isPromise from './is-promise';

export default class SyncPromise {
  static resolve = value => new SyncPromise(resolve => resolve(value));

  static reject = reason => new SyncPromise((_, reject) => reject(reason));

  static all = promises =>
    new SyncPromise((resolve, reject) => {
      let done = 0;
      const values = [];
      for (let i = 0, l = promises.length; i < l; ++i) {
        promises[i].then(value => {
          values[i] = value;
          if (++done === l) resolve(values);
        }, reject);
      }
    });

  static race = promises =>
    new SyncPromise((resolve, reject) => {
      for (let i = 0, l = promises.length; i < l; ++i) {
        promises[i].then(resolve, reject);
      }
    });

  constructor(callback) {
    const complete = (state, value) => {
      const {handlers, handlers: {length: l}} = this;
      this.state = state;
      this.value = value;
      for (let i = 0; i < l; ++i) handlers[i][state](value);
      handlers.length = 0;
    };

    const resolve = value => {
      if (isPromise(value)) return value.then(resolve, reject);
      try { complete('fulfilled', value); } catch (er) { reject(er); }
    };

    const reject = reason => complete('rejected', reason);

    this.state = 'pending';
    this.handlers = [];
    try { callback(resolve, reject); } catch (er) { reject(er); }
  }

  then(onFulfilled, onRejected) {
    return new SyncPromise((resolve, reject) => {
      const {handlers, state, value} = this;

      const runFulfilled =
        onFulfilled ? value => resolve(onFulfilled(value)) : resolve;

      const runRejected =
        onRejected ? value => resolve(onRejected(value)) : reject;

      if (state === 'fulfilled') return runFulfilled(value);

      if (state === 'rejected') return runRejected(value);

      handlers.push({fulfilled: runFulfilled, rejected: runRejected});
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}
