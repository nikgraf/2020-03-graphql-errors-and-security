const { getProducts, createProduct, getProduct } = require("../db/products");
const { login, updateUser } = require("../db/users");
const {
  AuthenticationError,
  ForbiddenError,
  UserInputError
} = require("apollo-server");

module.exports = {
  Query: {
    products: () => getProducts()
  },
  Mutation: {
    createProduct: (_parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must log in to create new products."
        );
      }
      if (context.user.role !== "admin") {
        throw new ForbiddenError("You must be an admin to create Products.");
      }
      if (args.input.name.length < 3) {
        throw new UserInputError("Form Arguments invalid", {
          invalidArgs: ["input.name"]
        });
      }

      return { product: createProduct(args.input) };
    },
    login: (_parent, args) => {
      return login(args.input.email, args.input.password);
    },
    addProductToCart: (_parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must log in to create new products."
        );
      }
      const amount = context.user.cart[args.input.productId]
        ? args.input.amount + context.user.cart[args.input.productId].amount
        : args.input.amount;

      const cart = { ...context.user.cart, [args.input.productId]: amount };
      const updatedUser = { ...context.user, cart };
      updateUser(updatedUser);
      const cartItems = Object.keys(cart).map(productId => {
        return {
          product: getProduct(productId),
          amount: cart[productId]
        };
      });
      return { cartItems };
    }
  }
};
