const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/tienda.json');

function getUsers() {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data.users;
}

function saveUsers(users) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.users = users;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  getUsers,
  saveUsers
};
