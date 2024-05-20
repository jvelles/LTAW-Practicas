const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 9090;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Configurar la carpeta de vistas

// Funciones para manejar datos
const getData = () => {
  const dataPath = path.join(__dirname, 'data', 'tienda.json');
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
};

const saveData = (data) => {
  const dataPath = path.join(__dirname, 'data', 'tienda.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Rutas
app.get('/', (req, res) => {
  const data = getData();
  const user = req.session.user ? req.session.user.username : null;
  res.render('index', { products: data.products, user });
});

const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');

app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/cart', cartRoutes);
app.use('/admin', adminRoutes);

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
