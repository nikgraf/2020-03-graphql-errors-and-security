const { getProducts, createProduct, getProduct } = require("../db/products");
const { login, updateUser } = require("../db/users");
const { UserInputError } = require("apollo-server");

module.exports = {
  Query: {
    products: () => getProducts()
  },
  Mutation: {
    login: (_parent, args) => {
      return login(args.input.email, args.input.password);
    },
    addProductToCart: (_parent, args) => {
      // verfiy productId -> UserInputError
      // verfiy amount is smaller than the product stock -> UserInputError
      return { amount: args.input.amount };
    },
    createProduct: (_parent, args, context) => {
      if (args.input.name.length < 3) {
        throw new UserInputError("Form Arguments invalid", {
          invalidArgs: ["input.name"]
        });
      }
      return { product: createProduct(args.input) };
    }
  }
};
