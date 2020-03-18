const { ApolloServer } = require("apollo-server");
const { importSchema } = require("graphql-import");
const resolvers = require("./resolvers");
const typeDefs = importSchema("./schema.graphql");
const { getUserByToken } = require("./db/users");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization
      ? req.headers.authorization.replace("Bearer ", "")
      : undefined;
    const user = getUserByToken(token);
    return { user, meaningOfLife: 42 };
  }
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
