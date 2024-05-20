const express = require('express');
const router = express.Router();
const { getProducts } = require('../models/product');
const { getOrders, saveOrders } = require('../models/order');

// Mostrar la página de finalización de compra
router.get('/checkout', (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) {
        return res.redirect('/cart');
    }
    res.render('checkout', { cart: req.session.cart, user: req.session.user ? req.session.user.username : null });
});

// Procesar el formulario de finalización de compra
router.post('/checkout', (req, res) => {
    const { address, cardNumber } = req.body;
    const orders = getOrders();

    const newOrder = {
        username: req.session.user.username,
        address,
        cardNumber,
        products: req.session.cart
    };

    orders.push(newOrder);
    saveOrders(orders);

    req.session.cart = [];
    res.render('order-confirmation', { order: newOrder, user: req.session.user ? req.session.user.username : null });
});

// Añadir un producto al carrito
router.post('/add', (req, res) => {
    const { productId } = req.body;
    const products = getProducts();
    const product = products.find(p => p.id == productId);

    if (!req.session.cart) {
        req.session.cart = [];
    }

    req.session.cart.push(product);
    res.redirect('/cart');
});

// Mostrar el carrito
router.get('/', (req, res) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    res.render('cart', { cart: req.session.cart, user: req.session.user ? req.session.user.username : null });
});

module.exports = router;
