module.exports = (app) => {
  const movies = require("../controllers/movies.js");
  var router = require("express").Router();

  router.get("/", movies.getAllMovies);

  router.get("/:id", movies.getMovieById);

  app.use("/api/movies", router);
};
