import { gql } from "apollo-server-express";

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    mobileNumber: String!
    country: String!
  }

  type Query {
    getAllRegisteredUsers: [User]
    userVerified(token: String!, email: String!): String!
    sendVerificationMail(token: String!): String
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    mobileNumber: String!
    country: String!
  }

  type AuthPayload {
    user: User
    token: String!
  }

  type Mutation {
    createUser(user: UserInput): User
    verifyUser(token: String!, email: String!): String
    resendVerificationMail(token: String!): String
    loginUser(email: String!, password: String!): AuthPayload
  }
`;

export default typeDefs;
