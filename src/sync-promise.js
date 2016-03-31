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
        }).catch(reject);
      }
    });

  static race = promises =>
    new SyncPromise((resolve, reject) => {
      for (let i = 0, l = promises.length; i < l; ++i) {
        promises[i].then(resolve).catch(reject);
      }
    });

  constructor(callback) {
    let completed = false;

    const complete = (state, value) => {
      completed = true;
      this.state = state;
      this.value = value;
      const callbacks = this.callbacks[state];
      for (let i = 0, l = callbacks.length; i < l; ++i) callbacks[i](value);
    };

    const resolve = value => {
      if (completed) return;
      if (isPromise(value)) return value.then(resolve).catch(reject);
      complete('fulfilled', value);
    };

    const reject = reason => {
      if (completed) return;
      if (isPromise(reason)) return reason.then(reject).catch(reject);
      complete('rejected', reason);
    };

    this.state = 'pending';
    this.callbacks = {fulfilled: [], rejected: []};
    try { callback(resolve, reject); } catch (er) { reject(er); }
  }

  then(onFulfilled, onRejected) {
    return new SyncPromise((resolve, reject) => {
      const {callbacks: {fulfilled, rejected}, state, value} = this;

      const runFulfilled =
        onFulfilled ? value => resolve(onFulfilled(value)) : resolve;

      const runRejected =
        onRejected ? value => resolve(onRejected(value)) : reject;

      if (state === 'fulfilled') return runFulfilled(value);
      if (state === 'rejected') return runRejected(value);
      fulfilled.push(runFulfilled);
      rejected.push(runRejected);
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}
