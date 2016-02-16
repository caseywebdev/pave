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
