module.exports = (sequelize, Sequelize) => {
  const Ticket = sequelize.define("ticket", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    seat_number: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    transaction_date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    total_cost: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
  });

  return Ticket;
};
