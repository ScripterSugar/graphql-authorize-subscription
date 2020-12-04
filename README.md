# graphql-authorize-subscription
A simple and light-weighted (0 dependency) helper function for authorize subscription with apollo-server


## Why would you want to use this library?

As for today (2020/12/04) the apollo server doesn't provides any feature to authorize graphQL subscription in resolver level. You can authenticate the users over connection level (with onConnection options) but production-grade projects usually have numerous authorizing contexts over subscription resolvers, and it's messy and hard to handle all of this authorizations within onConnection handler only.

There's no "Best practices" to do this right now, So I've ended up creating my own capsulized component to handle these resolver-level authorization for subscriptions.

Basically the library adds once executed resolver at the very front of asyncIterator, so you can use this function as pre processor of your subscription too. 


## Installation

`npm install graphql-authorize-subscription`

or

`yarn add graphql-authorize-subscription`

## Usage Examples

This library simply exports one higher-order function called `withAuthorization`. It's usage is almost same with withFilter.

it receives `originResolver`, your original subscription `ResolverFn`, as first argument.

and `authorizationResolver` as second argument. `authorizationResolver` is a simple resolver that returns anything and can be async function.

if you throw errors in `authorizationResolver`, the socket connection closes immediately and client will receive graphQL error payloads.


### Common Usage

```javascript
import { withFilter } from 'graphql-subscriptions';
import { withAuthorization } from 'graphql-authorize-subscription';
// import withAuthorization from 'graphql-authorize-subscription'; You can use the default export too.

export const authorizedResolvers = {
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

export const authorizedResolvers = {
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

## Useage as pre processor


```javascript
import { withFilter } from 'graphql-subscriptions';
import withPreprocess from 'graphql-authorize-subscription';

export const authorizedResolvers = {
  Subscription: {
    preprocessedSubscription: {
      subscribe: withPreprocess(
        withFilter(
          (parent, { taskId }) => pubsub.asyncIterator(`${CONSTANTS.SUBSCRIPTION.TASKS}.${taskId}`),
          (payload, { taskId }) => taskId === payload.preprocessedSubscription.taskId,
        ),
        async (parent, { taskId }, context, info) => {
          if (isTaskDoneAlready(taskId)) {
            throw new Error('ERR_TASK_FINISHED'); // In your front-end code mark the task as finished.
          }

          return true;
        }),
    },
  },
};

```
