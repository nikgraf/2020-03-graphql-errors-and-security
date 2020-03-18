const { getProducts, createProduct, getProduct } = require("../db/products");
const { login, updateUser } = require("../db/users");
const {
  UserInputError,
  AuthenticationError,
  ForbiddenError
} = require("apollo-server");

module.exports = {
  Query: {
    products: () => getProducts()
  },
  Mutation: {
    login: (_parent, args, context) => {
      return login(args.input.email, args.input.password);
    },
    addProductToCart: (_parent, args) => {
      const product = getProduct(args.input.productId);
      if (!product) {
        throw new UserInputError("Product doesn't exist", {
          invalidArgs: ["input.productId"]
        });
      }
      if (product.stock < args.input.amount) {
        throw new UserInputError(
          "Not enough items in stock for this product.",
          {
            invalidArgs: ["input.amount"]
          }
        );
      }
      return { amount: args.input.amount };
    },
    createProduct: (_parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "User must be logged in to create a Product."
        );
      }
      if (context.user.role !== "admin") {
        throw new ForbiddenError("Only Admins can create products.");
      }

      if (args.input.name.length < 3) {
        throw new UserInputError("Form Arguments invalid", {
          invalidArgs: ["input.name"]
        });
      }
      return { product: createProduct(args.input) };
    }
  }
};
