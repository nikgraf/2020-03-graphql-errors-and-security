# Lessons

## Intro to Example

Example query to get all products

```graphql
{
  products {
    name
  }
}
```

**NOTE** products should be a connection

Login Mutation

```graphql
mutation {
  login(input: { email: "anna@example.com", password: "123" }) {
    token
  }
}
```

## Mutation

Relay rules:

1. Mutations are named as verbs `createProduct`, `introduceShip`, `deleteCollection`.
2. Single argument input
3. The input type name is the capitalized mutation name with a `Input` postfix e.g. `CreateProductInput`, `IntroduceShipInput`.
4. The returned value is a new custom type that can contain various fields.
5. The return type is name is the capitalized mutation name with a `Payload` postfix e.g. `CreateProductPayload`, `IntroduceShipPayload`.

Source: https://relay.dev/docs/en/next/graphql-server-specification#mutations

createdProduct

```graphql
mutation {
  createProduct(input: { name: "USB-C to HDMI" }) {
    product {
      name
    }
  }
}
```

Exercise: addToCart

```graphql
mutation {
  addProductToCart(
    input: { productId: "86556f66-695c-42d1-a003-49920741659a", amount: 2 }
  ) {
    amount
  }
}
```

Bonus: return the full cart

```graphql
mutation {
  addProductToCart(
    input: { productId: "86556f66-695c-42d1-a003-49920741659a", amount: 2 }
  ) {
    cart {
      amount
      product {
        id
      }
    }
  }
}
```

## Built in GraphQL Errors

Try this mutation which is not fitting to the implemented Schema:

```graphql
mutation {
  createProduct(input: { name: "USB-C to HDMI" }) {
    name
  }
}
```

Contract for both the client as well as the server -> you can rely on it, but you need to comply to it.

-> show data & error

## Custom Error Handling

Just throw an error from within a resolver

```js
throw new Error("Whatever");
```

```js
if (args.input.name.length < 3) {
  throw new UserInputError("Form Arguments invalid", {
    invalidArgs: ["input.name"]
  });
}
```

- createProduct (product name must have at least 3 characters)

Exercise: Throw UserInputError errors

- verfiy product for productId exists -> if not UserInputError
- verfiy amount is smaller than the product stock -> if not UserInputError

Hint: use `const { getProduct } = require("../db/products");` to retrieve the actual product.

## Secure an Endpoint (authentication & authorization)

General concept: verify a cookie or token.
Use the GraphQL concet to pass in the authenticated user.
Use this user in every resolver to verify that the user has access to the returned data.

--> see presentation

createdProduct - authentication by admin
addToCart (exercise) - authentication

Alternative approach: https://github.com/maticzav/graphql-shield (haven't tried on a large scale project, but there was always the concern that it falls short in more granular cases in production)

## Proper Authentication & Authorization Error Handling in Apollo

```
throw new AuthenticationError('must authenticate');

throw new ForbiddenError("You must log in to create a new Product.");
```

Bonus: Define your own errors

```
new ApolloError(message, code, additionalProperties);
```

## Error Handling in Production

`debug: false` to apollo server

or

NODE_ENV=production
NODE_ENV=test

## Best Practice: Error Message Localization

Where?

Do it on the server.
Keep the code to identify errors on the client.

## The other Way how Errors are handled

The issue with GraphQL errors: they are global!

This makes it hard to manage them when having expected input e.g. form errors.

There is a trend to not put these expected errors onto the global errros, but return an error field or Union on the result.

Then it's handled this way:

- global errors -> unexpected errors
- error field/Unions -> expected errors

```graphql
type UserInputError {
  message: String
  code: Int
  fieldPath: [String!]
}

type CreateProductPayload {
  product: Product
  errors: [UserInputError!]
}
```

Expected error examples: not enough balance on the credit card / login.
Facebook engineers mentioned in Podcasts that they handled it differently: there are no expected errors, validate it before.

While it has many benefits there are Issues with this approach:

- not a standard and people need to learn about it
- not a standard and therefor tools won't work with this pattern out of the box!
- an be forgotten to be fetched -> can be enforced, but that's non-standard behaviour

## Security

GraphQL gives enormous power to clients.

### 4 Attack Vectors

- Query Depth
- List Size
- Query Breadth
- Rate aka Denial of Service (Dos)

#### Query Depth

```graphql
query {
  user(id: "abc") {
    products {
      author {
        products {
          author {
            products {
              author {
                # keep on doing this nesting
                name
              }
            }
          }
        }
      }
    }
  }
}
```

#### List Size

```graphql
query {
  products(limit: 100000) {
    name
  }
}
```

#### Query Breadth

```graphql
query {
  alias1: product(id: "abc") { name }
  alias2: product(id: "cde") { name }
  ...
  alias100000: product(id: "xyz") { name }
}
```

#### Rate aka Denial of Service (Dos)

Simultaneously sending 100000 requests asking for

```graphql
query {
  product(id: "abc") {
    name
  }
}
```

### Strategies

#### Byte Size Limiting

```js
app.use("*", (req, res, next) => {
  const query = req.query.query || req.body.query || "";
  if (query.length > 2000) {
    throw new Error("Query too large");
  }
  next();
});
```

Pro:

- Easy to implement

Con:

- Very impalanced if the attacker just chooses queries and mutations with short names that are still expensive
- Doesn't protect agains (Denial of Service) DoS

#### Query Whitelistening (Persisted Queries)

Pro:

- Comes with Apollo

Con:

- Really only usable for private APIs
- Doesn't protect agains (Denial of Service) DoS

#### Timeout

For example max 5 seconds.

Pro:

- Will help your infrastructure to self-heal.
- Simple to implement?!

Con:

- Doesn't allow for predictable results and valid queries might stop working for some time.
- Affects everbody querying the system.

#### Query Complexity

Pro:

- Solves Query Depth, List Size, Query Breadth
- Predictable Results
- Reject queries before executing them by statically analyzing the complexity

Con:

- Takes effort to predict, measure and rebalance complexity (except you take a simple approach over every item counts one)
- Doesn't protect aggains (Denial of Service) DoS
- Affects everbody querying the system.

#### Query Complexity Limited over Time

Pro:

- Harder to implement
- Predictable Results

Con:

- Takes effort to predict, measure and rebalance complexity (except you take a simple approach over every item counts one)

Probably the most recommended solution by now e.g. Github is using it.

### Introspection Query

Turn it off in production in case you endpoint is non-public:

- Doesn't expose beta features
- Bit of security by obscurity

```js
config: {
  introspection: false,
}
```

### Security in Practice

Github: The GraphQL API v4 rate limit is 5,000 points per hour
https://developer.github.com/v4/guides/resource-limitations/

Facebook uses CPU Cycle per query according to https://twitter.com/sgrove/status/1239422271707480065

### Security Exercise

Use https://github.com/pa-bru/graphql-cost-analysis and implement complexity analysis.

Use the version posted here to setup the Cost Analysis: https://github.com/pa-bru/graphql-cost-analysis/issues/12#issuecomment-594782746
