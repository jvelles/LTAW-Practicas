const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/tienda.json'); // Ajusta la ruta si es necesario

function updateStock() {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  data.products.forEach(product => {
    // Establece el stock de cada producto al valor deseado
    product.stock = 10; // Puedes ajustar el valor según tus necesidades
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('Stock actualizado correctamente.');
}

updateStock();
