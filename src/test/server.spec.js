// Imports the server.js file to be tested.
const server = require("../server");
// Assertion (Test Driven Development) and Should,  Expect(Behaviour driven development) library
const chai = require("chai");
// Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

describe("Server!", () => {
  // positive test case given to test / endpoint.
  it("Renders the home page without issues", (done) =>
  {
    chai
      .request(server)
      .get("/")
      .end((err, res) =>
      {
        expect(res).to.have.status(200);
        done();
      });
  });

  // negative test case for "/add" where the date is the wrong format
  it("Doesn't add a movie with an invalid date type", (done) =>
  {
    const movie =
    {
      poster: "https://m.media-amazon.com/images/M/MV5BOGZhM2FhNTItODAzNi00YjA0LWEyN2UtNjJlYWQzYzU1MDg5L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
      title: "Shrek",
      release: "123",
      rating: 7.0,
      plot: "meme"
    };

    chai
      .request(server)
      .post("/add")
      .send(movie)
      .end((err, res) =>
      {
        expect(res).to.have.status(404);
        done();
      });
  });
});
