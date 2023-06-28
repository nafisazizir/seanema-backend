module.exports = (sequelize, Sequelize) => {
  const Showtime = sequelize.define("showtime", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    show_date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    start_time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    end_time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
  });

  return Showtime;
};
