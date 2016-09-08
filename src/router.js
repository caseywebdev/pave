import runQuery from './run-query';
import Store from './store';

export default class Router {
  constructor({maxQueryCost, routes = {}} = {}) {
    this.maxQueryCost = maxQueryCost;
    this.routes = routes;
  }

  run({force, query, store = new Store()}) {
    const {maxQueryCost, routes} = this;
    return runQuery({force, maxQueryCost, query, routes, store});
  }
}
