import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import app from "../src/server.js";
import User from "../src/model/user.model.js";

chai.use(chaiHttp);

const peter = {
  name: "Peter Franklin",
  email: "peter@example.com",
  password: "FidiaChallenge123$",
  mobileNumber: "+2349042475834",
  country: "Ghana",
};

const user = await User.findOne({ email: peter.email });

if (!user) {
  await User.create(peter);
}

describe("Fidia Backend Challenge Mutation", () => {
  // The signup mutation works as expected
  describe("signup mutation should accept name, email, password, mobileNumber and country then return user data asked for in request", () => {
    it("it should create user and return id, name, email, password, mobileNumber and country", (done) => {
      chai
        .request(app)
        .post("/graphql")
        .set("content-type", "application/json")
        .send({
          query: `mutation {
            createUser(user: {
              name: "Fidia Test Account",
              email: "komolafetoyin17@gmail.com",
              password: "fidiaChallenge123$",
              mobileNumber: "+2348107559527"
              country: "Nigeria"
            }) {
              id
              name
              email
              mobileNumber
              country
            }
          }`,
        })
        .end((error, response) => {
          assert.equal(response.status, 200);
          assert.typeOf(response.body, "object");
          assert.typeOf(response.body.data.createUser, "object");
          assert.property(response.body.data.createUser, "id");
          assert.property(response.body.data.createUser, "name");
          assert.property(response.body.data.createUser, "email");
          assert.property(response.body.data.createUser, "mobileNumber");
          assert.property(response.body.data.createUser, "country");
          assert.typeOf(response.body.data.createUser.id, "string");
        });
      done();
    });
  });

  // The login mutation does not allow unverified users to log in (Don’t test for verified users)
  describe("login mutaion does not allow unverified users to log in", () => {
    it("it should return email is not verified and prompt to check user's email", (done) => {
      chai
        .request(app)
        .post("/graphql")
        .set("content-type", "application/json")
        .send({
          query: `mutation {
            loginUser(email: "${peter.email}", password: "${peter.password}") {
              user {
                id
                name
                email
                mobileNumber
                country
              },
              token
            }
          }`,
        })
        .end((error, response) => {
          assert.typeOf(response.body, "object");
          assert.equal(
            response.body.errors[0].message,
            "Email is not verified. Please check your email to verify your account."
          );
          assert.equal(response.body.data.loginUser, null);
          assert.equal(
            response.body.errors[0].extensions.code,
            "UNAUTHENTICATED"
          );
        });
      done();
    });
  });

  // The query for fetching a list of all registered users work as expected
  describe("feching a list of all registered users", () => {
    it("it should return a list of all registered users", (done) => {
      chai
        .request(app)
        .get(
          "/graphql?query=query {getAllRegisteredUsers { id, name, email, mobileNumber, country }}"
        )
        .end((error, response) => {
          assert.equal(response.status, 200);
          assert.typeOf(response.body, "object");
          assert.typeOf(response.body.data.getAllRegisteredUsers, "array");
        });
      done();
    });
    it("it should return a list of registered users with id name email mobileNumber and country", (done) => {
      chai
        .request(app)
        .get(
          "/graphql?query=query {getAllRegisteredUsers { id, name, email, mobileNumber, country }}"
        )
        .end((error, response) => {
          assert.equal(response.status, 200);
          assert.property(response.body.data.getAllRegisteredUsers[0], "id");
          assert.property(response.body.data.getAllRegisteredUsers[0], "name");
          assert.property(response.body.data.getAllRegisteredUsers[0], "email");
          assert.property(
            response.body.data.getAllRegisteredUsers[0],
            "mobileNumber"
          );
          assert.property(
            response.body.data.getAllRegisteredUsers[0],
            "country"
          );
        });
      done();
    });
  });
});
