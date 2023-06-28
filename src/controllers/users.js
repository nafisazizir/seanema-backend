const db = require("../models");
const Op = db.Sequelize.Op;
const User = db.users;
const bcrypt = require("bcrypt");

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
          return res.status(200).json({ message: "Login successful" });
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
  const userId = req.params.userId;

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
