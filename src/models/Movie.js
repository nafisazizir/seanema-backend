module.exports = (sequelize, Sequelize) => {
  const Movie = sequelize.define("movie", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    release_date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    poster_url: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    age_rating: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    ticket_price: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });

  return Movie;
};
