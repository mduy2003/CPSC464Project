const path = require('path');
const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'prototype-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.message = req.session.message || null;
  req.session.message = null;
  next();
});

app.get('/', (req, res) => {
  res.redirect('/groups');
});

app.use(authRoutes);
app.use('/groups', groupRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  req.session.message = 'Unexpected error occurred.';
  res.redirect('/groups');
});

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Study Group Finder running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize app:', err);
    process.exit(1);
  }
}

start();
