import * as jwt from "jsonwebtoken";
const SECRET = "test_token";

export interface AuthTokenPayload {
  userId: number;
  role: string;
}

export function decodeAuthHeader(authHeader: string): AuthTokenPayload {
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    throw new Error("No token found");
  }
  return jwt.verify(token, SECRET) as AuthTokenPayload;
}
