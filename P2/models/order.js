const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/tienda.json');

function getOrders() {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data.orders;
}

function saveOrders(orders) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.orders = orders;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  getOrders,
  saveOrders
};
