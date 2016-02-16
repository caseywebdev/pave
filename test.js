'use strict';

var _chai = require('chai');

var _ = require('.');

var _global = global;
var describe = _global.describe;
var it = _global.it;


describe('Store', function () {
  it('gets', function () {
    var store = new _.Store({ cache: { foo: 'bar' } });
    (0, _chai.expect)(store.get(['foo'])).to.equal('bar');
  });

  it('sets', function () {
    var store = new _.Store();
    store.set(['foo'], 'bar');
    (0, _chai.expect)(store.get(['foo'])).to.equal('bar');
  });

  it('fires a debounced change event', function (done) {
    var store = new _.Store();
    store.on('change', done);
    store.set(['foo'], 'bar');
    store.set(['baz'], 'buz');
  });

  it('fails running a query with the default router', function (done) {
    var store = new _.Store();
    store.run({ query: ['dne'] }).catch(function (er) {
      (0, _chai.expect)(er).to.be.an.instanceOf(Error);
      done();
    });
  });
});

describe('SyncPromise', function () {
  it('can sync resolve', function () {
    var foo = 'bar';
    _.SyncPromise.resolve('baz').then(function (val) {
      return foo = val;
    });
    (0, _chai.expect)(foo).to.equal('baz');
  });

  it('can sync reject', function () {
    var foo = 'bar';
    new _.SyncPromise(function () {
      throw 'baz';
    }).catch(function (val) {
      return foo = val;
    });
    (0, _chai.expect)(foo).to.equal('baz');
  });

  it('can chain', function (done) {
    Promise.resolve('foo').then(function (val) {
      (0, _chai.expect)(val).to.equal('foo');
      return 'bar';
    }).then(function (val) {
      (0, _chai.expect)(val).to.equal('bar');
      throw 'baz';
    }).catch(function (val) {
      (0, _chai.expect)(val).to.equal('baz');
      done();
    });
  });

  it('resolves in order', function (done) {
    _.SyncPromise.all([new _.SyncPromise(function (resolve) {
      return setTimeout(function () {
        return resolve('foo');
      });
    }), _.SyncPromise.resolve('bar'), new _.SyncPromise(function (resolve) {
      return setTimeout(function () {
        return resolve('baz');
      });
    })]).then(function (val) {
      (0, _chai.expect)(val).to.deep.equal(['foo', 'bar', 'baz']);
      done();
    }).catch(done);
  });
});
