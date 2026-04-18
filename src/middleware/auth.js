function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.message = 'Please log in to continue.';
    res.redirect('/login');
    return;
  }
  next();
}

module.exports = {
  requireAuth,
};
