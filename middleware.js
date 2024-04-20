const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/failure"); // Redirect to login page if not authenticated
};

const middleware = { isLoggedIn };
export default middleware;
