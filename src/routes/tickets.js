module.exports = (app) => {
  const auth = require("../middleware/auth");
  const tickets = require("../controllers/tickets.js");
  var router = require("express").Router();

  router.post("/book", auth, tickets.bookTickets);
  router.post("/payment/:id", auth, tickets.updatePayment);

  app.use("/api/tickets", router);
};
