import { strict as assert } from 'assert';

import execute from './execute.js';

export default async () => {
  const Root = {
    selfLink: () => ({ _link: Root }),
    selfLinkWithAddition: () => ({
      _link: { ...Root, addition: true }
    }),
    linkWithObj: () => ({ _link: Foo, obj: { id: 1 } }),
    constant: { always: 'the same' },
    version: '123',
    null: null,
    undefined: undefined,
    queryEcho: ({ query }) => ({ _literal: true, ...query })
  };

  const Foo = {
    id: ({ obj }) => obj.id,
    sub: {
      list: ({ obj: { id }, args: { prefix } }) => [
        { ignore: true, name: `${prefix}a-${id}` },
        { ignore: true, name: `${prefix}b-${id}` },
        { ignore: true, name: `${prefix}c-${id}` }
      ]
    },
    literal: { _literal: true, return: 'this', as: { is: {} } }
  };

  const query = {
    _from: 'dude',
    selfLink: {
      selfLinkWithAddition: {
        addition: {}
      }
    },
    renamed: {
      _from: 'constant',
      always: {}
    },
    linkWithObj: {
      id: {}
    },
    version: {},
    node: {
      _from: 'linkWithObj',
      sub: {
        list: { _args: { prefix: 'pre-' }, name: {} }
      },
      literal: { these: { do: { not: { matter: {} } } } }
    },
    null: {},
    undefined: {},
    absent: {},
    query: { _args: { doNotShow: true }, _from: 'queryEcho', foo: 1, bar: 2 }
  };

  const expected = {
    selfLink: {
      selfLinkWithAddition: {
        addition: true
      }
    },
    renamed: {
      always: 'the same'
    },
    linkWithObj: {
      id: 1
    },
    version: '123',
    node: {
      sub: {
        list: [{ name: 'pre-a-1' }, { name: 'pre-b-1' }, { name: 'pre-c-1' }]
      },
      literal: { _literal: true, return: 'this', as: { is: {} } }
    },
    null: null,
    undefined: null,
    absent: null,
    query: {
      _literal: true,
      foo: 1,
      bar: 2
    }
  };

  assert.deepEqual(await execute({ node: Root, query }), expected);
};
