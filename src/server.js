import { config } from "dotenv";
import express from "express";
import cors from "cors";
import connectToDB from "./config/database.config";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./graphql/user/typeDefs.graphql.user";
import resolvers from "./graphql/user/resolvers.graphql.user";

config();

const app = express();

app.use(cors());

const PORT = process.env.NODE_ENV === "dev" ? 3427 : process.env.PORT || 8000;

const apolloServer = new ApolloServer({ typeDefs, resolvers });

await apolloServer.start();

apolloServer.applyMiddleware({ app });

app.get("/", (request, response) => {
  response.status(200).json({
    status: "success",
    message: "welcome to Tito's Fidia Backend Challenge",
  });
});

connectToDB();

app.listen(PORT, () =>
  console.log(
    `server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode.\npress CTRL-C to stop`
  )
);
