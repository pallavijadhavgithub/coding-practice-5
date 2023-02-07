const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
const path = require("path");

module.exports = app;
app.use(express.json());

const filePath = path.join(__dirname, "moviesData.db");
let db = null;

const convertingIntoCamelcase = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertingIntoCamelcaseDirector = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

const initializerDbAndServer = async () => {
  try {
    db = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error : ${e.message}`);
  }
};
initializerDbAndServer();

//GET moviesList API
app.get("/movies/", async (request, response) => {
  const getMoviesListQuery = `
        SELECT movie_name
        FROM movie
        `;
  const movieArrays = await db.all(getMoviesListQuery);
  response.send(
    movieArrays.map((eachmovie) => convertingIntoCamelcase(eachmovie))
  );
});

//post add movie API
app.post("/movies", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const getAddMovieQuery = `
    INSERT INTO 
        movie (director_id, movie_name, lead_actor)
    VALUES(
         6,
         'Jurassic Park',
         'Jeff Goldblum'
    );`;
  const dbResponse = await db.run(getAddMovieQuery);
  //   const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//GET a movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT * 
        FROM movie
        WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertingIntoCamelcase(movie));
});

//PUT movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const getUpdatedMovie = `
        UPDATE 
            movie
        SET 
            director_id = 24,
            movie_name = 'Thor',
            lead_actor = 'christopher'
        WHERE 
            movie_id = ${movieId}`;

  await db.run(getUpdatedMovie);
  response.send("Movie Details Updated");
});

//DELETE movie API
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM movie
        WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET directories API
app.get("/directors/", async (request, response) => {
  const getDirectoryQuery = `
        SELECT *
        FROM director;`;
  const directoryArray = await db.all(getDirectoryQuery);
  response.send(
    directoryArray.map((eachDirectory) =>
      convertingIntoCamelcaseDirector(eachDirectory)
    )
  );
});

//GET list of movies API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getListMovieQuery = `
        SELECT movie_name
        FROM movie
        WHERE director_id = ${directorId};`;
  const movies = await db.all(getListMovieQuery);
  response.send(movies.map((movie) => convertingIntoCamelcase(movie)));
});
