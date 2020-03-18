const { ApolloServer } = require("apollo-server");
const costAnalysis = require("graphql-cost-analysis").default;

class CostAnalysisApolloServer extends ApolloServer {
  async createGraphQLServerOptions(req, res) {
    const options = await super.createGraphQLServerOptions(req, res);

    options.validationRules = options.validationRules
      ? options.validationRules.slice()
      : [];
    options.validationRules.push(
      costAnalysis({
        variables: req.body.variables,
        maximumCost: 400,
        defaultCost: 1
        // onComplete: costs => console.log(`costs: ${costs} (max: 1234)`)
      })
    );

    return options;
  }
}

module.exports = CostAnalysisApolloServer;
