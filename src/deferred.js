import SyncPromise from './sync-promise';

export default class Deferred {
  constructor() {
    this.promise = new SyncPromise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
