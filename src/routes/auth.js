const express = require('express');
const bcrypt = require('bcryptjs');
const { get, run } = require('../db');

const router = express.Router();

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    req.session.message = 'All fields are required.';
    res.redirect('/signup');
    return;
  }

  if (password.length < 6) {
    req.session.message = 'Password must be at least 6 characters.';
    res.redirect('/signup');
    return;
  }

  try {
    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      req.session.message = 'An account with this email already exists.';
      res.redirect('/signup');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), passwordHash]
    );

    req.session.user = {
      id: result.lastID,
      name: name.trim(),
      email: email.toLowerCase().trim(),
    };
    req.session.message = 'Account created successfully.';
    res.redirect('/groups');
  } catch (err) {
    req.session.message = 'Could not create account.';
    res.redirect('/signup');
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.session.message = 'Email and password are required.';
    res.redirect('/login');
    return;
  }

  try {
    const user = await get('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email.toLowerCase().trim()]);

    if (!user) {
      req.session.message = 'Invalid email or password.';
      res.redirect('/login');
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      req.session.message = 'Invalid email or password.';
      res.redirect('/login');
      return;
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    req.session.message = 'Welcome back.';
    res.redirect('/groups');
  } catch (err) {
    req.session.message = 'Login failed. Please try again.';
    res.redirect('/login');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
