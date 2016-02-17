import {expect} from 'chai';
import {Router, Store, SyncPromise} from '.';

const {describe, it} = global;

describe('Store', () => {
  it('gets', () => {
    const store = new Store({cache: {foo: 'bar'}});
    expect(store.get(['foo'])).to.equal('bar');
  });

  it('sets', () => {
    const store = new Store();
    store.set(['foo'], 'bar');
    expect(store.get(['foo'])).to.equal('bar');
  });

  it('fires a debounced change event', done => {
    const store = new Store();
    store.on('change', done);
    store.set(['foo'], 'bar');
    store.set(['baz'], 'buz');
  });

  it('fails running a query with the default router', done => {
    const store = new Store();
    store.run({query: ['dne']}).catch(er => {
      expect(er).to.be.an.instanceOf(Error);
      done();
    });
  });
});

describe('SyncPromise', () => {
  it('can sync resolve', () => {
    let foo = 'bar';
    SyncPromise.resolve('baz').then(val => foo = val);
    expect(foo).to.equal('baz');
  });

  it('can sync reject', () => {
    let foo = 'bar';
    new SyncPromise(() => { throw 'baz'; }).catch(val => foo = val);
    expect(foo).to.equal('baz');
  });

  it('can chain', done => {
    Promise.resolve('foo')
      .then(val => {
        expect(val).to.equal('foo');
        return 'bar';
      })
      .then(val => {
        expect(val).to.equal('bar');
        throw 'baz';
      })
      .catch(val => {
        expect(val).to.equal('baz');
        done();
      });
  });

  it('resolves in order', done => {
    SyncPromise.all([
      new SyncPromise(resolve => setTimeout(() => resolve('foo'))),
      SyncPromise.resolve('bar'),
      new SyncPromise(resolve => setTimeout(() => resolve('baz')))
    ]).then(val => {
      expect(val).to.deep.equal(['foo', 'bar', 'baz']);
      done();
    }).catch(done);
  });
});

describe('Router', () => {
  it('groups plural args', done => {
    let objs, keys, wildcard;
    new Router({
      routes: {
        'foo.$objs': ({1: _keys}) => objs = _keys,
        'foo.$keys': ({1: _keys}) => keys = _keys,
        'etc.*': ({1: _keys}) => wildcard = _keys
      }
    }).run({
      query: [[
        ['foo', [1, {1: true}, '1', {2: true}, 2, {3: true}]],
        ['foo', [1, 1, '1', '1', 2, 3, {3: true}]],
        ['etc', [1, 2, 3, 3, {7: true}, {7: true}, {8: false}, {9: true}]]
      ]]
    }).then(() => {
      expect(objs).to.deep.equal([{1: true}, {2: true}, {3: true}]);
      expect(keys).to.deep.equal([1, 2, 3]);
      expect(wildcard).to.deep.equal([1, 2, 3, {7: true}, {8: false}, {9: true}]);
      done();
    }).catch(done);
  });

  it('spans singular args', done => {
    let objCalls = 0;
    let keyCalls = 0;
    let oneCalls = 0;
    let twoCalls = 0;
    new Router({
      routes: {
        'foo.$obj': () => ++objCalls,
        'foo.$key': () => ++keyCalls,
        1: () => ++oneCalls,
        2: () => ++twoCalls
      }
    }).run({
      query: [[
        ['foo', [1, {1: true}, '1', {2: true}, 2, {3: true}]],
        ['foo', [1, 1, '1', '1', 2, 3, {3: true}]],
        [1],
        [1],
        [2],
        ['2'],
        [['1', 2]],
        ['foo', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]
      ]]
    }).then(() => {
      expect(objCalls).to.equal(3);
      expect(keyCalls).to.equal(10);
      expect(oneCalls).to.equal(1);
      expect(twoCalls).to.equal(1);
      done();
    }).catch(done);
  });
});
