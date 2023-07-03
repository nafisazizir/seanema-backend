module.exports = (app) => {
  const auth = require("../middleware/auth");
  const users = require("../controllers/users.js");
  var router = require("express").Router();

  router.post("/register", users.register);
  router.post("/login", users.login);
  router.get("/balance", auth, users.getBalance);
  router.post("/topup", auth, users.topUpBalance);
  router.post("/withdraw", auth, users.withdrawBalance);
  router.get("/check-age/:showtimeId", auth, users.checkAge);

  app.use("/api/user", router);
};
