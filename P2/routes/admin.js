const express = require('express');
const router = express.Router();
const { getProducts, saveProducts } = require('../models/product');

// Mostrar el formulario de administración
router.get('/', (req, res) => {
    if (req.session.user && req.session.user.username === 'root') {
        res.render('admin', { user: req.session.user.username });
    } else {
        res.redirect('/');
    }
});

// Añadir un nuevo producto
router.post('/add-product', (req, res) => {
    if (req.session.user && req.session.user.username === 'root') {
        const { name, description, price, stock, image } = req.body;
        const products = getProducts();
        
        const newProduct = {
            id: products.length + 1,
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            image
        };
        
        products.push(newProduct);
        saveProducts(products);
        
        res.redirect('/admin');
    } else {
        res.redirect('/');
    }
});

module.exports = router;
