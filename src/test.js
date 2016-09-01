import {expect} from 'chai';

const {describe, it} = global;

import applyDelta from './apply-delta';
describe('applyDelta', () => {
  it('updates immutably', () => {
    const a = {foo: {bar: {$ref: ['bar']}}, bar: 1, baz: 2, bang: []};
    const b = applyDelta(a, {
      foo: {bar: {$set: {$ref: ['baz']}}},
      bar: {$set: 2},
      baz: {$set: 3},
      bang: {$push: 1}
    });
    expect(a).to.not.equal(b);
    expect(a.foo).to.not.equal(b.foo);
    expect(b.foo.bar).to.deep.equal({$ref: ['baz']});
    expect(a.bar).to.equal(1);
    expect(b.bar).to.equal(2);
    expect(a.baz).to.equal(2);
    expect(b.baz).to.equal(3);
    expect(a.bang).to.not.equal(b.bang);
  });
});

import clone from './clone';
describe('clone', () => {
  it('clones objects', () => {
    const a = {foo: 'bar', buz: 'baz'};
    const b = clone(a);
    expect(b).to.deep.equal(a);
    expect(b).to.not.equal(a);
  });

  it('clones arrays', () => {
    const a = ['foo', 'bar', 1, 2];
    const b = clone(a);
    expect(b).to.deep.equal(a);
    expect(b).to.not.equal(a);
  });

  it('clones values', () => {
    const a = 'foo';
    const b = clone(a);
    expect(b).to.equal(a);
  });
});

import deltaDirectives from './delta-directives';
describe('deltaDirectives', () => {
  it('has $set', () => {
    const obj = {foo: 'bar'};
    const val = {buz: 'baz'};
    expect(deltaDirectives.$set(obj, val)).to.equal(val);
  });

  it('has $unset', () => {
    const obj = {foo: 'bar'};
    expect(deltaDirectives.$unset(obj)).to.equal(undefined);
  });

  it('has $merge', () => {
    const obj = {foo: 'bar'};
    const val = {buz: 'baz'};
    expect(deltaDirectives.$merge(obj, val)).to.deep.equal({...obj, ...val});
  });

  it('has $apply', () => {
    const obj = {foo: 'bar'};
    const val = () => 'foo';
    expect(deltaDirectives.$apply(obj, val)).to.equal(val(obj));
  });

  it('has $splice (array)', () => {
    const obj = [1, 2, 3];
    const val = [[0, 1, 0], [2, 1, 4]];
    expect(deltaDirectives.$splice(obj, val)).to.deep.equal([0, 2, 4]);
  });

  it('has $splice (array-like object)', () => {
    const obj = {0: 1, 1: 2, 2: 3, length: 3};
    const val = [[0, 1, 0], [1, 2]];
    expect(deltaDirectives.$splice(obj, val)).to.deep.equal({0: 0, length: 1});
  });

  it('has $push', () => {
    const obj = [1, 2, 3];
    const val = 4;
    expect(deltaDirectives.$push(obj, val)).to.deep.equal([1, 2, 3, 4]);
  });

  it('has $unshift', () => {
    const obj = [1, 2, 3];
    const val = [-1, 0];
    expect(deltaDirectives.$unshift(obj, val)).to.deep.equal([-1, 0, 1, 2, 3]);
  });

  it('has $pop', () => {
    const obj = {0: 1, 1: 2, 2: 3, length: 3};
    expect(deltaDirectives.$pop(obj))
      .to.deep.equal({0: 1, 1: 2, length: 2});
  });

  it('has $shift', () => {
    const obj = {0: 1, 1: 2, 2: 3, length: 3};
    expect(deltaDirectives.$shift(obj))
      .to.deep.equal({0: 2, 1: 3, length: 2});
  });
});

import isEqual from './is-equal';
describe('isEqual', () => {
  it('detects strictly inequal changes', () => {
    expect(isEqual(['foo'], {foo: {bar: 1}}, {foo: {bar: 1}})).to.equal(false);
  });

  it('detects strictly inequal changes', () => {
    const foo = {bar: {$ref: ['bar']}};
    const a = {foo, bar: 1};
    const b = {foo, bar: 2};
    expect(isEqual(['foo'], a, b)).to.equal(false);
  });

  it('detects strictly equal changes', () => {
    const foo = {bar: {$ref: ['bar']}};
    const a = {foo, bar: 1};
    const b = {foo, bar: 1};
    expect(isEqual(['foo'], a, b)).to.equal(true);
  });
});

import {Router, Store, SyncPromise, toKey} from '.';
describe('Store', () => {
  it('gets', () => {
    const store = new Store({cache: {foo: 'bar'}});
    expect(store.get(['foo'])).to.equal('bar');
  });

  it('gets circular', () => {
    const store = new Store({
      cache: {
        foo: {
          name: 'foo',
          friends: [
            {$ref: ['bar']},
            {$ref: ['baz']}
          ]
        },
        bar: {
          name: 'bar',
          friends: [
            {$ref: ['foo']}
          ]
        }
      }
    });
    const foo = store.get(['foo']);
    expect(foo.name).to.equal('foo');
    expect(foo.friends[0].name).to.equal('bar');
    expect(foo.friends[1]).to.equal(undefined);
    expect(foo.friends[0].friends[0]).to.equal(foo);
    expect(foo.friends[0].friends[0].friends[0]).to.equal(foo.friends[0]);
  });

  it('getRaws', () => {
    const store = new Store({
      cache: {
        foo: {bar: {$ref: ['bar']}},
        bar: {baz: {$ref: ['baz']}},
        baz: 1
      }
    });
    expect(store.getRaw(['foo', 'bar', 'baz'])).to.deep.equal({$ref: ['baz']});
  });

  it('updates', () => {
    const store = new Store();
    store.update({foo: {$set: 'bar'}});
    expect(store.get(['foo'])).to.equal('bar');
  });

  it('updates $refs correctly', () => {
    const store = new Store({cache: {foo: {$ref: ['bar']}, bar: 1}});
    store.update({foo: {$set: {$ref: ['baz']}}});
    expect(store.cache.foo).to.deep.equal({$ref: ['baz']});
  });

  it('resolves', () => {
    const store = new Store({
      cache: {
        foo: {$ref: ['bar']},
        bar: {$ref: ['baz']},
        baz: 1,
        buz: {$ref: ['dne']}
      }
    });
    expect(store.resolve(['foo'])).to.deep.equal(['baz']);
    expect(store.resolve(['buz'])).to.deep.equal(['dne']);
    expect(store.resolve(['buz', 'bang'])).to.deep.equal(['dne', 'bang']);
  });

  it('watches', done => {
    (new Store({cache: {foo: 'foo'}}))
      .watch(['baz'], (prev, delta) => {
        expect(prev).to.deep.equal({foo: 'bar'});
        expect(delta).to.deep.equal({baz: {$set: 'buz'}});
        done();
      })
      .update({foo: {$set: 'bar'}})
      .update({baz: {$set: 'buz'}});
  });

  it('watches ref changes', () => {
    let calls = {};
    (new Store({
      cache: {
        foo: {
          bing: 'bong',
          fizz: {$ref: ['buz']},
          bar: {$ref: ['bar']}
        },
        bar: {name: 'baz'}
      }
    }))
      .watch(['foo'], () => calls[0] = true)
      .watch(['foo', 'bing'], () => calls[1] = true)
      .watch(['bar', 'name'], () => calls[2] = true)
      .watch(['bar', 'crawl'], () => calls[3] = true)
      .update({bar: {name: {$set: 'BAZ!'}}});
    expect(calls).to.deep.equal({0: true, 2: true});
  });

  it('works with complex keys', done => {
    (new Store())
      .watch(['foo', toKey({bar: 'baz'})], () => done())
      .update({foo: {[toKey({bar: 'baz'})]: {$set: 'buz'}}});
  });

  it('removes an watch handler', done => {
    const store = new Store();
    const handler = () => { throw new Error('Should not be called!'); };
    store
      .watch(['foo'], handler)
      .unwatch(handler)
      .watch([], () => done())
      .update({foo: {$set: 'bar'}});
  });

  it('can remove a handler in a trigger', done => {
    const store = new Store();
    const handler = () => store.unwatch(handler);
    store
      .watch(['foo'], handler)
      .watch(['foo'], () => done())
      .update({foo: {$set: 'bar'}});
  });

  it('fails running a query with the default router', done => {
    const store = new Store();
    store.run({query: ['dne']}).catch(er => {
      expect(er).to.be.an.instanceOf(Error);
      done();
    });
  });

  it('catches nested exceptions in router', done => {
    const error = new Error('foo');
    new Store({
      batchDelay: 1,
      router: new Router({
        routes: {
          foo: ({store}) =>
            store.run({query: ['bar']}).then(() => { throw error; }),

          bar: () => ({bar: {$set: 'bar'}})
        }
      })
    }).run({query: ['foo']})
      .then(
        () => { throw new Error('Expected an error!'); },
        er => {
          expect(er).to.equal(error);
          done();
        }
      )
      .catch(done);
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
  it('limits expensive queries', done => {
    new Router({
      maxQueryCost: 2
    }).run({query: ['foo', 'bar', 'baz']})
      .then(
        () => { throw new Error('Expected an expensive query error'); },
        er => {
          expect(er).to.equal(Router.EXPENSIVE_QUERY_ERROR);
          done();
        }
      ).catch(done);
  });

  it('has a default no route matches error', done => {
    new Router().run({query: ['foo', 'bar', 'baz']})
      .then(
        () => { throw new Error('Expected a no route matches error'); },
        er => {
          expect(er.message).to.contain('No route matches');
          done();
        }
      ).catch(done);
  });

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

  it('runs bangs before reads', done => {
    new Store({
      cache: {foo: 0},
      router: new Router({
        routes: {
          'addToFoo!.$key': ({1: n}) => ({foo: {$apply: m => m + n}}),
          foo: ({store}) => expect(store.get(['foo'])).to.equal(10)
        }
      })
    }).run({
      force: true,
      query: [[
        ['foo'],
        ['addToFoo!', 2],
        ['addToFoo!', 3],
        ['foo'],
        ['addToFoo!', 5]
      ]]
    }).then(() => done()).catch(done);
  });
});

import queryToPaths from './query-to-paths';
import treeToQuery from './tree-to-query';
import pathsToTree from './paths-to-tree';
describe('treeToQuery', () => {
  it('works', () => {
    [
      [],
      [[]],
      [['a']],
      [['a', 'b', 'c']],
      [['a', 'b'], ['a', 'c']],
      [
        ['a', 'b'],
        ['a', 'c'],
        ['a', 'c', 'd'],
        ['a', 'c', 'e']
      ],
      [
        ['search', 0, 'id'],
        ['search', 0, 'name'],
        ['search', 1, 'id'],
        ['search', 1, 'name'],
        ['search', 2, 'id'],
        ['search', 2, 'name'],
        ['search', 3, {obj: true}, 'bar']
      ]
    ].forEach(paths =>
      expect(queryToPaths(treeToQuery(pathsToTree(paths))))
        .to.deep.equal(paths)
    );
  });
});
