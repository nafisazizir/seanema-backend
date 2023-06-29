const db = require("../models");
const Ticket = db.tickets;
const Showtime = db.showtimes;
const Movie = db.movies;
const User = db.users;
const Op = db.Sequelize.Op;

// booking ticket
exports.bookTickets = async (req, res) => {
  try {
    let { showtimeId, seatNumbers, status } = req.query;
    const userId = req.userId;
    seatNumbers = Array.isArray(seatNumbers)
      ? seatNumbers.map((seat) => parseInt(seat))
      : [parseInt(seatNumbers)].filter(Boolean);

    // Check if the showtime exists
    const showtime = await Showtime.findByPk(showtimeId, { include: Movie });
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    if (seatNumbers.length > 6) {
      return res
        .status(404)
        .json({ message: "Maximum 6 seats per transaction!" });
    }

    // Check if the seat numbers are available for booking
    const bookedSeats = await Ticket.findAll({
      where: {
        showtime_id: showtimeId,
        status: {
          [Op.ne]: "cancelled",
        },
      },
    });
    const bookedSeatNumbers = bookedSeats
      .map((ticket) =>
        ticket.seat_number.split(",").map((num) => parseInt(num))
      )
      .flat();

    const unavailableSeatNumbers = seatNumbers.filter((seatNumber) =>
      bookedSeatNumbers.includes(seatNumber)
    );
    if (unavailableSeatNumbers.length > 0) {
      return res.status(400).json({
        message: "Some seat numbers are already booked",
        unavailableSeatNumbers: unavailableSeatNumbers,
      });
    }

    const totalCost = showtime.movie.ticket_price * seatNumbers.length;

    const user = await User.findByPk(userId);

    if (totalCost > user.balance || status === "not paid") {
      Ticket.create({
        user_id: user.id,
        showtime_id: showtimeId,
        seat_number: seatNumbers.toString(),
        transaction_date: new Date(),
        total_cost: totalCost,
        status: "not paid",
      })
        .then(() => {
          res.status(201).json({ message: "Please complete the payment!" });
        })
        .catch((error) => {
          res.status(500).json({ message: "Failed to book tickets", error });
        });
    } else {
      user.balance -= totalCost;
      user.save();

      Ticket.create({
        user_id: user.id,
        showtime_id: showtimeId,
        seat_number: seatNumbers.toString(),
        transaction_date: new Date(),
        total_cost: totalCost,
        status: "paid",
      })
        .then(() => {
          res.status(201).json({ message: "Transaction success!" });
        })
        .catch((error) => {
          res.status(500).json({ message: "Failed to book tickets", error });
        });
    }
  } catch (error) {
    console.error("Error booking tickets:", error);
    return res.status(500).json({ message: "Failed to book tickets" });
  }
};

// update payment
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    // Check if the logged-in user is the owner of the ticket
    if (ticket.user_id !== userId) {
      return res.status(403).json({
        message: "Access denied. User is not the owner of the ticket.",
      });
    }

    const user = await User.findByPk(userId);
    if (user.balance < ticket.total_cost) {
      return res.status(400).json({
        message: "Balance is not sufficient!",
      });
    }

    // Update the payment status to "paid"
    user.balance -= ticket.total_cost;
    user.save();
    ticket.status = "paid";
    ticket.save();

    return res.status(200).json({ message: "Payment status updated to paid." });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res
      .status(500)
      .json({ message: "Failed to update payment status." });
  }
};

// get the available seats
exports.getAvailableSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    // Retrieve the showtime
    const showtime = await Showtime.findByPk(showtimeId);

    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    // Retrieve all booked seats for the showtime
    const bookedSeats = await Ticket.findAll({
      where: {
        showtime_id: showtimeId,
        status: {
          [Op.ne]: "cancelled",
        },
      },
    });

    // Extract the booked seat numbers
    const bookedSeatNumbers = bookedSeats
      .map((ticket) =>
        ticket.seat_number.split(",").map((num) => parseInt(num))
      )
      .flat();

    // Generate the list of available seats
    const availableSeats = [];

    for (let seatNumber = 1; seatNumber <= 64; seatNumber++) {
      if (!bookedSeatNumbers.includes(seatNumber)) {
        availableSeats.push(seatNumber);
      }
    }

    return res.status(200).json({ availableSeats });
  } catch (error) {
    console.error("Error retrieving available seats:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve available seats" });
  }
};

// get ticket history
exports.getTicketHistory = async (req, res) => {
  try {
    const userId = req.userId;

    // Retrieve the ticket transaction history for the user
    const ticketHistory = await Ticket.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: Showtime,
          include: [Movie],
        },
      ],
    });

    return res.status(200).json({ ticketHistory });
  } catch (error) {
    console.error("Error retrieving ticket history:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve ticket history" });
  }
};

// cancel ticket
exports.cancelTicket = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;

    // Find the ticket by ID and user ID
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    // Check if the logged-in user is the owner of the ticket
    if (ticket.user_id !== userId) {
      return res.status(403).json({
        message: "Access denied. User is not the owner of the ticket.",
      });
    }

    // Check if the ticket is already canceled
    if (ticket.status === "cancelled") {
      return res.status(400).json({ message: "Ticket is already canceled" });
    } else if (ticket.status === "not paid") {
      ticket.status = "cancelled";
      ticket.save();
      return res.status(200).json({ message: "Ticket successfully canceled" });
    } else if (ticket.status === "paid") {
      const user = await User.findByPk(userId);
      user.balance += ticket.total_cost;
      user.save();
      ticket.status = "cancelled";
      ticket.save();
      return res.status(200).json({
        message: "Ticket successfully canceled and you money already refunded",
      });
    }
    
  } catch (error) {
    console.error("Error canceling ticket:", error);
    return res.status(500).json({ message: "Failed to cancel ticket" });
  }
};
