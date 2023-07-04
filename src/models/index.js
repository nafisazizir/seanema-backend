const dbConfig = process.env;

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.POSTGRES_DATABASE, dbConfig.POSTGRES_USER, dbConfig.POSTGRES_PASSWORD, {
  host: dbConfig.POSTGRES_HOST,
  dialect: "postgres",
  dialectOptions: { ssl: {} },
  logging: false,
  define: {
    timestamps: false,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.movies = require("./Movie.js")(sequelize, Sequelize);
db.showtimes = require("./Showtime.js")(sequelize, Sequelize);
db.tickets = require("./Ticket.js")(sequelize, Sequelize);
db.users = require("./User.js")(sequelize, Sequelize);

db.showtimes.belongsTo(db.movies, { foreignKey: "movie_id" });
db.tickets.belongsTo(db.users, { foreignKey: "user_id" });
db.tickets.belongsTo(db.showtimes, { foreignKey: "showtime_id" });

module.exports = db;
