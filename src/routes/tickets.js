module.exports = (app) => {
  const auth = require("../middleware/auth");
  const tickets = require("../controllers/tickets.js");
  var router = require("express").Router();

  router.post("/book", auth, tickets.bookTickets);
  router.post("/payment/:id", auth, tickets.updatePayment);
  router.get("/seats/:showtimeId", tickets.getAvailableSeats);
  router.get("/history", auth, tickets.getTicketHistory);
  router.post("/cancel/:id", auth, tickets.cancelTicket);

  app.use("/api/tickets", router);
};
