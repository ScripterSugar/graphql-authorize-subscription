# graphql-authorize-subscription
A simple helper function for authorize subscription with apollo-server


## Installation

`npm install graphql-authorize-subscription`

or

`yarn install graphql-authorize-subscription`

## Usage Examples

This library simply exports one higher-order function called `withAuthorization`. It's usage is almost same with withFilter.

it receives `originResolver`, your original subscription `ResolverFn`, as first argument.

and `authorizationResolver` as second argument. `authorizationResolver` is a simple resolver that returns anything and can be async function.

if you throw errors in `authorizationResolver`, the socket connection closes immediately and client will receive graphQL error payloads.


### Common Usage

```javascript
import { withFilter } from 'graphql-subscriptions';
import { withAuthorization } from 'graphql-authorize-subscription';

export const notificationResolvers = {
  Subscription: {
    authorizedSubscription: {
      subscribe: withAuthorization(
        // First argument is your original subscription resolver function.
        (parent, { somePrivateId }) => pubsub.asyncIterator(`${CONSTANTS.SUBSCRIPTION.SUBSCRIPTIONKEY}.${somePrivateId}`),
        
        // Here in second argument, define your own authorization resolver. it receives all the arguments that normal resolver get.
        async (parent, { somePrivateId }, context, info) => {
          if (!await doSomeHeavyAuthorizationTaskWithDatas( ... )) {
            throw errors.UNAUTHORIZED();
          }

          return true;
        }),
    },
  },
};

```

### Usage over withFilter

```javascript
import { withFilter } from 'graphql-subscriptions';
import { withAuthorization } from 'graphql-authorize-subscription';

export const notificationResolvers = {
  Subscription: {
    authorizedSubscription: {
      subscribe: withAuthorization(
        // First argument is your original subscription resolver function.
        withFilter(
          (parent, { somePrivateId }) => pubsub.asyncIterator(`${CONSTANTS.SUBSCRIPTION.SUBSCRIPTIONKEY}.${somePrivateId}`),
          (payload, { somePrivateId }) => somePrivateId === payload.authorizedSubscription.somePrivateId,
        ),
        
        // Here in second argument, define your own authorization resolver. it receives all the arguments that normal resolver get.
        async (parent, { somePrivateId }, context, info) => {
          if (!await doSomeHeavyAuthorizationTaskWithDatas( ... )) {
            throw errors.UNAUTHORIZED();
          }

          return true;
        }),
    },
  },
};

```
