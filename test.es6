import {expect} from 'chai';
import {Store} from '.';

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
