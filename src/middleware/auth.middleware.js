import jwt from "jsonwebtoken";

export async function verifyAuthToken(token) {
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return null;
    }
    return decoded;
  });
}
