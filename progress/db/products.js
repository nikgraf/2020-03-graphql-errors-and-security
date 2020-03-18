const uuid = require("uuid/v4");

const products = [
  {
    id: "968cfbf1-4312-453a-adae-62cba0f1507f",
    name: "Blackbook",
    stock: 42
  },
  {
    id: "86556f66-695c-42d1-a003-49920741659a",
    name: "Greenbook",
    stock: 943
  }
];

const getProducts = () => products;

const getProduct = productId =>
  products.find(product => product.id === productId);

const createProduct = product => {
  const productWithId = { ...product, id: uuid() };
  products.push(productWithId);
  return productWithId;
};

module.exports = {
  getProduct,
  getProducts,
  createProduct
};
