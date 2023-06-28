module.exports = (app) => {
  const users = require("../controllers/users.js");
  var router = require("express").Router();

  router.post("/register", users.register);
  router.post("/login", users.login);

  app.use("/api/user", router);
};
