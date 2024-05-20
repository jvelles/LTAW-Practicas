const express = require('express');
const router = express.Router();
const path = require('path');
const { getUsers, saveUsers } = require('../models/user');

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.send('Usuario o contraseña incorrectos');
  }
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/register.html'));
});

router.post('/register', (req, res) => {
  const { username, realname, email, password } = req.body;
  let users = getUsers();
  users.push({ username, realname, email, password });
  saveUsers(users);
  res.redirect('/user/login');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
