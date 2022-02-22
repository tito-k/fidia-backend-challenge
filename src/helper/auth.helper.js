import { config } from "dotenv";
import jwt from "jsonwebtoken";

config();

export const generateAuthToken = ({ id, name, email, mobileNumber }) =>
  jwt.sign({ id, name, email, mobileNumber }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

export default generateAuthToken;
