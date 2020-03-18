const { ApolloServer } = require("apollo-server");
const { importSchema } = require("graphql-import");
const graphql = require("graphql");
const resolvers = require("./resolvers");
const typeDefs = importSchema("./schema.graphql");
const { getUserByToken } = require("./db/users");
const CostAnalysisApolloServer = require("./utils/cost-analysis-apollo-server");

const server = new CostAnalysisApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization
      ? req.headers.authorization.replace("Bearer ", "")
      : undefined;
    const user = getUserByToken(token);
    return { user };
  },
  introspection: true,
  debug: true
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
