import User from "./models/User.js";

const isLoggedIn = async (req, res, next) => {
  if (req.user) {
    let { email } = req.user;
    let info = await User.findOne({ email });
    if (info) {
      next();
    } else {
      console.log("middleware/ user is not registered");
      res.redirect("/failure");
    }
  } else {
    res.redirect("/failure");
  }
};

const middleware = { isLoggedIn };
export default middleware;
