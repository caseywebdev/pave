import isEqual from './is-equal.js';

export default ({ client, useCallback, useEffect, useRef, useState }) => ({
  context: _context,
  query: _query
}) => {
  const [context, setContext] = useState(_context);
  const [data, setData] = useState(client.cacheExecute({ query: _query }));
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState(_query);
  const executeId = useRef(0);

  useEffect(() => {
    if (!isEqual(query, _query)) setQuery(_query);
  }, [query, _query]);

  useEffect(() => {
    if (!isEqual(context, _context)) setContext(_context);
  }, [context, _context]);

  const execute = useCallback(async () => {
    const id = ++executeId.current;
    setError(null);
    setIsLoading(true);
    let error;
    try {
      await client.execute({ context, query });
    } catch (er) {
      error = er;
    }
    if (id !== executeId.current) return;

    if (error) setError(error);
    setIsLoading(false);
  }, [context, query]);

  useEffect(() => {
    execute();
  }, [execute]);

  useEffect(() => client.watch({ onChange: setData, query }), [query]);

  return { data, error, isLoading, execute };
};
