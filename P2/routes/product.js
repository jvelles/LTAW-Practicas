const express = require('express');
const router = express.Router();
const { getProducts } = require('../models/product');

// Ruta para autocompletado
router.get('/autocomplete', (req, res) => {
  const query = req.query.q.toLowerCase();
  const products = getProducts();
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query)
  );
  res.json(filteredProducts);
});

// Ruta para búsqueda de productos
router.get('/search', (req, res) => {
  const query = req.query.q.toLowerCase();
  const products = getProducts();
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query)
  );

  if (filteredProducts.length === 1) {
    // Redirigir a la página del producto si hay una coincidencia exacta
    const product = filteredProducts[0];
    res.redirect(`/product/${product.id}`);
  } else {
    // Mostrar la lista de productos si hay múltiples coincidencias
    res.render('index', { products: filteredProducts, user: req.session.user ? req.session.user.username : null });
  }
});

// Ruta para mostrar la página del producto
router.get('/:id', (req, res) => {
  const productId = req.params.id;
  const products = getProducts();
  const product = products.find(p => p.id === parseInt(productId));

  if (product) {
    res.render('product', { product, user: req.session.user ? req.session.user.username : null });
  } else {
    res.status(404).send('Producto no encontrado');
  }
});

module.exports = router;
