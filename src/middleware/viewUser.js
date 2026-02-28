function viewUser(req, res, next) {
    res.locals.currentUser = req.session.userId || null;
    next();
}

module.exports = viewUser;