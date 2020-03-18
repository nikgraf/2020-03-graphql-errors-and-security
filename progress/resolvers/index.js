const { getProducts, createProduct, getProduct } = require("../db/products");
const { login, updateUser } = require("../db/users");

module.exports = {
  Query: {
    products: () => getProducts()
  },
  Mutation: {
    login: (_parent, args) => {
      return login(args.input.email, args.input.password);
    },
    addProductToCart: (_parent, args) => {
      return { amount: args.input.amount };
    }
  }
};
