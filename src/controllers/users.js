const db = require("../models");
const Op = db.Sequelize.Op;
const User = db.users;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// register
exports.register = (req, res) => {
  const { username, password, name, age } = req.query;

  // Check if the username already exists
  User.findOne({ where: { username } })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Validate the password
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(password)) {
        let message =
          "Password must contain at least one alphabet and one number";
        if (password.length < 8) {
          message = "Password must be at least 8 characters long";
        }
        return res.status(400).json({ message });
      }

      // Generate a salt and hash the password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error hashing password", error: err });
        }

        // Create a new user with the hashed password
        User.create({ username, password: hashedPassword, name, age })
          .then((user) => {
            res
              .status(201)
              .json({ message: "User registered successfully", user });
          })
          .catch((error) => {
            res.status(500).json({ message: "Failed to register user", error });
          });
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error checking username availability", error });
    });
};

// login
exports.login = (req, res) => {
  const { username, password } = req.query;

  // Find the user by username
  User.findOne({ where: { username } })
    .then((user) => {
      if (!user) {
        // User not found
        return res.status(404).json({ message: "Username not found" });
      }

      // Compare the provided password with the stored hashed password
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          // Error occurred during password comparison
          return res.status(500).json({ message: "Internal server error" });
        }

        if (result) {
          // Passwords match, user is authenticated
          const token = jwt.sign({ userId: user.id }, process.env.TOKEN_KEY);
          return res
            .status(200)
            .json({ message: "Login successful", token: token });
        } else {
          // Passwords do not match
          return res.status(401).json({ message: "Incorrect password" });
        }
      });
    })
    .catch((err) => {
      // Error occurred during user retrieval
      return res.status(500).json({ message: "Internal server error" });
    });
};

// get balance
exports.getBalance = (req, res) => {
  const userId = req.userId;

  // Find the user by their ID
  User.findByPk(userId)
    .then((user) => {
      if (!user) {
        // User not found
        return res.status(404).json({ message: "User not found" });
      }

      // Return the user's balance
      return res.status(200).json({ balance: user.balance });
    })
    .catch((err) => {
      // Error occurred during user retrieval
      return res.status(500).json({ message: "Internal server error" });
    });
};

// top-up balance
exports.topUpBalance = (req, res) => {
  const userId = req.userId;
  let { amount } = req.query;
  amount = parseInt(amount);

  // Find the user by their ID
  User.findByPk(userId)
    .then((user) => {
      if (!user) {
        // User not found
        return res.status(404).json({ message: "User not found" });
      }

      if (amount <= 0) {
        return res
          .status(400)
          .json({ message: "You must top up positive amount of money" });
      }

      try {
        // Update the user's balance
        user.balance += amount;
        user.save();

        return res
          .status(200)
          .json({ message: "Balance successfully topped up" });
      } catch (err) {
        return res.status(500).json({ message: "Failed to top up balance" });
      }
    })
    .catch((err) => {
      // Error occurred during user retrieval
      return res.status(500).json({ message: "Internal server error" });
    });
};

// withdraw balance
exports.withdrawBalance = (req, res) => {
  const userId = req.userId;
  let { amount } = req.query;
  amount = parseInt(amount);

  // Find the user by their ID
  User.findByPk(userId)
    .then((user) => {
      if (!user) {
        // User not found
        return res.status(404).json({ message: "User not found" });
      }

      if (amount > user.balance) {
        return res
          .status(400)
          .json({ message: "Your balance is not sufficience" });
      }

      if (amount > 500000) {
        return res
          .status(400)
          .json({ message: "The maximum withdrawal limit is Rp 500.000" });
      }

      try {
        // Update the user's balance
        user.balance -= amount;
        user.save();

        return res
          .status(200)
          .json({ message: "Balance successfully withdrawn" });
      } catch (err) {
        return res.status(500).json({ message: "Failed to withdraw balance" });
      }
    })
    .catch((err) => {
      // Error occurred during user retrieval
      return res.status(500).json({ message: "Internal server error" });
    });
};
