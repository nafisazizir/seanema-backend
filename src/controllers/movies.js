const db = require("../models");
const Movie = db.movies;
const Showtime = db.showtimes;
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

exports.getShowtimes = (req, res) => {
  const { id } = req.params;

  // Check if the movie exists
  Movie.findOne({ where: { id: id } })
    .then((movie) => {
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      // Fetch showtimes from the database for the given movieId
      Showtime.findAll({ where: { movie_id: id } })
        .then((showtimes) => {
          // Group showtimes by show date
          const showtimesByDate = groupShowtimesByDate(showtimes);

          res.status(200).json(showtimesByDate);
        })
        .catch((error) => {
          console.error("Failed to retrieve showtimes:", error);
          res
            .status(500)
            .json({ message: "Failed to retrieve showtimes", error });
        });
    })
    .catch((error) => {
      console.error("Failed to retrieve movie:", error);
      res.status(500).json({ message: "Failed to retrieve movie", error });
    });
};

exports.getShowtimeDetails = (req, res) => {
  const { id } = req.params;

  // Check if the movie exists
  Showtime.findOne({ where: { id: id } })
    .then((showtime) => {
      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }

      res.status(200).json(showtime);
    })
    .catch((error) => {
      console.error("Failed to retrieve showtime:", error);
      res.status(500).json({ message: "Failed to retrieve showtime", error });
    });
};

const groupShowtimesByDate = (showtimes) => {
  const showtimesByDate = {};

  showtimes.forEach((showtime) => {
    const show_date = showtime.show_date;

    if (!showtimesByDate[show_date]) {
      showtimesByDate[show_date] = [];
    }

    showtimesByDate[show_date].push(showtime);
  });

  return showtimesByDate;
};
