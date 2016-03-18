'use strict';

var _chai = require('chai');

var _2 = require('.');

var _global = global;
var describe = _global.describe;
var it = _global.it;


describe('Store', function () {
  it('gets', function () {
    var store = new _2.Store({ cache: { foo: 'bar' } });
    (0, _chai.expect)(store.get(['foo'])).to.equal('bar');
  });

  it('getRaws', function () {
    var store = new _2.Store({
      cache: {
        foo: { bar: { $ref: ['bar'] } },
        bar: { baz: { $ref: ['baz'] } },
        baz: 1
      }
    });
    (0, _chai.expect)(store.getRaw(['foo', 'bar', 'baz'])).to.deep.equal({ $ref: ['baz'] });
  });

  it('sets', function () {
    var store = new _2.Store();
    store.set(['foo'], 'bar');
    (0, _chai.expect)(store.get(['foo'])).to.equal('bar');
  });

  it('fires a debounced change event', function (done) {
    var store = new _2.Store();
    store.on('change', done);
    store.set(['foo'], 'bar');
    store.set(['baz'], 'buz');
  });

  it('removes an event handler', function (done) {
    var store = new _2.Store();
    var handler = function handler() {
      throw new Error('Should not be called!');
    };
    store.on('change', handler).off('change', handler).on('change', done);
    store.set(['foo'], 'bar');
    store.set(['baz'], 'buz');
  });

  it('fails running a query with the default router', function (done) {
    var store = new _2.Store();
    store.run({ query: ['dne'] }).catch(function (er) {
      (0, _chai.expect)(er).to.be.an.instanceOf(Error);
      done();
    });
  });
});

describe('SyncPromise', function () {
  it('can sync resolve', function () {
    var foo = 'bar';
    _2.SyncPromise.resolve('baz').then(function (val) {
      return foo = val;
    });
    (0, _chai.expect)(foo).to.equal('baz');
  });

  it('can sync reject', function () {
    var foo = 'bar';
    new _2.SyncPromise(function () {
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
    _2.SyncPromise.all([new _2.SyncPromise(function (resolve) {
      return setTimeout(function () {
        return resolve('foo');
      });
    }), _2.SyncPromise.resolve('bar'), new _2.SyncPromise(function (resolve) {
      return setTimeout(function () {
        return resolve('baz');
      });
    })]).then(function (val) {
      (0, _chai.expect)(val).to.deep.equal(['foo', 'bar', 'baz']);
      done();
    }).catch(done);
  });
});

describe('Router', function () {
  it('groups plural args', function (done) {
    var objs = undefined,
        keys = undefined,
        wildcard = undefined;
    new _2.Router({
      routes: {
        'foo.$objs': function foo$objs(_ref) {
          var _keys = _ref[1];
          return objs = _keys;
        },
        'foo.$keys': function foo$keys(_ref2) {
          var _keys = _ref2[1];
          return keys = _keys;
        },
        'etc.*': function etc(_ref3) {
          var _keys = _ref3[1];
          return wildcard = _keys;
        }
      }
    }).run({
      query: [[['foo', [1, { 1: true }, '1', { 2: true }, 2, { 3: true }]], ['foo', [1, 1, '1', '1', 2, 3, { 3: true }]], ['etc', [1, 2, 3, 3, { 7: true }, { 7: true }, { 8: false }, { 9: true }]]]]
    }).then(function () {
      (0, _chai.expect)(objs).to.deep.equal([{ 1: true }, { 2: true }, { 3: true }]);
      (0, _chai.expect)(keys).to.deep.equal([1, 2, 3]);
      (0, _chai.expect)(wildcard).to.deep.equal([1, 2, 3, { 7: true }, { 8: false }, { 9: true }]);
      done();
    }).catch(done);
  });

  it('spans singular args', function (done) {
    var objCalls = 0;
    var keyCalls = 0;
    var oneCalls = 0;
    var twoCalls = 0;
    new _2.Router({
      routes: {
        'foo.$obj': function foo$obj() {
          return ++objCalls;
        },
        'foo.$key': function foo$key() {
          return ++keyCalls;
        },
        1: function _() {
          return ++oneCalls;
        },
        2: function _() {
          return ++twoCalls;
        }
      }
    }).run({
      query: [[['foo', [1, { 1: true }, '1', { 2: true }, 2, { 3: true }]], ['foo', [1, 1, '1', '1', 2, 3, { 3: true }]], [1], [1], [2], ['2'], [['1', 2]], ['foo', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]]]
    }).then(function () {
      (0, _chai.expect)(objCalls).to.equal(3);
      (0, _chai.expect)(keyCalls).to.equal(10);
      (0, _chai.expect)(oneCalls).to.equal(1);
      (0, _chai.expect)(twoCalls).to.equal(1);
      done();
    }).catch(done);
  });
});
