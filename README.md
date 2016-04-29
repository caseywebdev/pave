# Pave

Paving the way to better state management.

[Try out pave in your browser.](https://tonicdev.com/npm/pave)

## Why?

Pave is inspired by [Relay], [GraphQL], [Falcor] and [Om (next)]. Pave attempts
to take the best pieces of each (subjectively) and expose a simple API that
makes managing app state much easier.

## Goals

- Performance: The core of any data layer will have many hot paths and should
  run efficiently.

- Schema-less: Unlike GraphQL, there is no requirement that your data is
  strictly typed.

- POJO: All data is represented as JSON-friendly Plain Ol' JavaScript Objects so
  there is no need to worry about how to serialize `X` and how to deserialize
  `Y`.

- Multiple Remotes: Create a client side router to use Pave with an existing
  REST API, implement a Pave router on the server or mix and match. Allowing
  multiple remotes both on the client and server makes integrating Pave into an
  existing project manageable.

## Install

```bash
npm install pave
```

## API

### Router

#### new Router({maxQueryCost, routes: `Object`})

- `maxQueryCost` (optional) is disabled by default. Use this property to limit
  the number of path parts that may be parsed in a single `run`.

  ```js
  import {Router} from 'pave';

  const router = new Router({maxQueryCost: 10});

  // query cost is 3, no problem
  router.run({query: ['foo', 'bar', 'baz']});

  // query cost is 6, also no problem
  router.run({query: ['foo', [0, 1], 'bar']});

  // query cost is 12, will throw an error
  router.run({query: ['foo', [0, 1], ['bar', 'baz']});
  ```

- `routes` is an object that maps route matchers to their handlers. The keys of
  this object can use one or a mix of different keywords.

    - `$key` matches exactly 1 scalar value

    - `$keys` matches `n` scalar values

    - `$obj` matches exactly 1 object

    - `$objs` matches `n` objects

    - `*` matches everything

  Handlers should return either a delta to be applied to the store cache or a
  promise.

  ```js
  import {Router} from 'pave';

  const router = new Router({
    routes: {

      // A round that returns blog posts. The $obj argument will contain options
      // for listing these posts (in the example below, sort order). The $keys
      // argument will contain the indices of the items to return.
      'blogPosts.$obj.$keys':
      ({1: options, 2: range, store: {cache: {userId}}}) =>
        db('blogPosts')
          .select('*')
          .where({creatorId: userId})
          .orderBy('createdAt', options.order || 'desc')
          .offset(range[0])
          .limit(range[range.length - 1] - range[0])
          .then(blogPosts => ({
            blogPostsById: {
              blogPosts.reduce((posts, post) => {
                posts[post.id] = {$set: post};
                return posts;
              }, {})
            },
            blogPosts: {
              [toKey(options)]: range.reduce((posts, n, i) => {
                posts[n] = {$set: {$ref: ['blogPostsById', blogPosts[i].id]}};
                return posts;
              }
            }
          })),

      // The catch-all matcher can be used to throw an error when no route
      // matches or...
      '*': ({query}) => throw new Error(`No route found for ${query}`)

      // ...proxy the unmatched portion of the query to another
      // router.
      '*': ({query}) => myOtherRouter.run({query})
    }
  });

  router.run({
    query: ['blogPosts', {order: 'asc'}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
    store: new Store({cache: {userId: 123}})
  }).then(...);
  ```

#### router.run({query: `Array`, store: `Store`}) => `SyncPromise`

Run the specified query and pass the given store through to each route handler.
Generally, this method should not be called directly but rather proxied through
a `Store` instance. When called through a store, the store will maintain a
reference to the router and routes called through that router can re-use the
given store to be used as an in-memory cache for potentially complicated
queries.

```js
(new Store({cache: {currentUserId: 123}, router}))
  .run({query})
  .then(...);
```

### Store

#### new Store({batchDelay: `Number`, cache: `Object`, router: `Router`})

- `batchDelay` (optional) is the amount of time to batch queries before sending
 them through the router. Defaults to `0`, meaning disable batching and run
 each query through the router immediately.

- `cache` (optional) is the initial value of the cache. Defaults to `{}`.

- `router` (optional) is the router to be used when invoking `run`.

#### store.get(`Array`) => `Any`

Returns the fully-resolved graph starting at the given path.

```js
import {Store} from 'pave';

const store = new Store({
  cache: {
    foo: {bar: {$ref: ['baz']}},
    baz: {name: 'Mr. Baz'}
  }
});

store.get([]); // => {foo: {bar: {name: 'Mr. Baz'}}, baz: {name: 'Mr. Baz'}}
store.get(['foo']); // => {bar: {name: 'Mr. Baz'}}
store.get(['foo', 'bar', 'name']); // => 'Mr. Baz'
store.get(['doesNotExist']); // => undefined
```

#### store.getRaw(`Array`) => `Any`

Returns the unresolved graph starting at the given path.

```js
import {Store} from 'pave';

const store = new Store({
  cache: {
    foo: {bar: {$ref: ['baz']}},
    baz: {name: 'Mr. Baz'}
  }
});

store.getRaw([]); // => {foo: {bar: {$ref: ['baz']}}, baz: {name: 'Mr. Baz'}}
store.getRaw(['foo']); // => {bar: {$ref: ['baz']}}
store.getRaw(['foo', 'bar', 'name']); // => 'Mr. Baz'
store.getRaw(['doesNotExist']); // => undefined
```

#### store.resolve(`Array`) => `Array`

Resolves a path in the graph to its simplest form.

```js
import {Store} from 'pave';

const store = new Store({
  cache: {
    foo: {bar: {$ref: ['baz']}},
    baz: {name: 'Mr. Baz'}
  }
});

store.resolve([]); // => []
store.resolve(['foo']); // => ['foo']
store.resolve(['foo', 'bar', 'name']); // => ['baz', 'name']
store.resolve(['doesNotExist']); // => ['doesNotExist']
```

#### store.run(`router.run options`) => `SyncPromise`

Passes the options to `store.router.run` and uses `store` to cache results. See
`router.run` for `run` information.

#### store.update(`Array` or `Object`) => `Store`

Immutably updates the cache based on the delta directives given. Available
directives are `$set`, `$merge`, `$apply`, `$splice`, `$push`, `$pop`, `$shift`
and `$unshift`. The array methods also work on array-like objects.

```js
import {Store} from 'pave';

const store = new Store({
  cache: {
    foo: {bar: {$ref: ['baz']}},
    baz: {name: 'Mr. Baz'}
  }
});

const {cache} = store;
store.update({baz: {name: {$set: 'Dr. Baz'}}});

// The original cache value is untouched. Store previous cache values to create
// an undo/redo stack.
cache === store.cache; // => false
store.get(['baz', 'name']); // => 'Dr. Baz'

store.update({whos: {$set: ['Cindy Lou', 'Augustus May']}});
store.get(['whos']); // => ['Cindy Lou', 'Augustus May']

store.update({whos: {$splice: [[0, 1, 'Martha May'], [2, 0, 'Betty Lou']]}});
store.get(['whos']); // => ['Martha May', 'Augustus May', 'Betty Lou']
```

#### store.watch(`Array`, `Function`) => `Store`

Watch a query for changes.

```js
import {Store} from 'pave';

const store = new Store({cache: {foo: 123}});

const handler = prev => {
  // The first argument, `prev` in this case, is the previous state of the
  // cache.
  console.log('foo changed!');
};

store.watch(['foo'], handler);
store.update({foo: {$set: 456}}); // The handler above will fire.
```

#### store.unwatch(`Function`) => `Store`

Stop watching a query for changes.

### toKey(`Any`) => `String`

Primarily useful for consistently serializing objects, `toKey` will take any value and convert it to it's Pave path segment representation.

```js
import {toKey} from 'pave';

toKey('foo'); // => 'foo'
toKey(123); // => '123'
toKey({a: 1, b: 2}); // => '{"a":1,"b":2}'
toKey({b: 2, a: 1}); // => '{"a":1,"b":2}'

store.update({foo: {[toKey({bar: 'baz'})]: {$set: 123}}});
```

[Falcor]: https://github.com/netflix/falcor
[GraphQL]: https://github.com/facebook/graphql
[Om (next)]: https://github.com/omcljs/om
[Relay]: https://github.com/facebook/relay
