const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/tienda.json');

function getProducts() {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data.products;
}

function saveProducts(products) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.products = products;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  getProducts,
  saveProducts
};
