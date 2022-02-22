import jwt from "jsonwebtoken";

export async function verifyAuthToken(token) {
  let result;
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      result = null;
    }
    result = decoded;
  });
  return result;
}
