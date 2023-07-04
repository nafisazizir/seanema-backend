require('pg')
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

const db = require("./src/models");
db.sequelize
  .sync()
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Seanema API!" });
});

require("./src/routes/movies")(app);
require("./src/routes/users")(app);
require("./src/routes/tickets")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
