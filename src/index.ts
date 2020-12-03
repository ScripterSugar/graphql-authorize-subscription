
type ResolverFn = (rootValue?: any, args?: any, context?: any, info?: any) => any;

export const withAuthorization = (asyncIterableResolver: ResolverFn, authorize: ResolverFn): ResolverFn => (...resolverArgs: Array<any>): any => ({
  __isAuthorized: false,
  [Symbol.asyncIterator]() {
    const asyncIterable = asyncIterableResolver(...resolverArgs);

    const originNext = asyncIterable.next;

    asyncIterable.next = async () => { // eslint-disable-line
      if (this.__isAuthorized) {
        return originNext.bind(asyncIterable)();
      }

      await authorize(...resolverArgs);

      this.__isAuthorized = true;

      return originNext.bind(asyncIterable)();
    };

    return asyncIterable;
  },
});

export default withAuthorization;
