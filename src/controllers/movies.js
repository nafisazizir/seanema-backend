const db = require("../models");
const Movie = db.movies;
const Op = db.Sequelize.Op;

exports.getAllMovies = (req, res) => {
  Movie.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving movie list.",
      });
    });
};

exports.getMovieById = (req, res) => {
  const { id } = req.params;

  Movie.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Movie with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error retrieving Movie with id=${id}`,
      });
    });
};
