import express  from "express";
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken';


dotenv.config();
const tokenSecret = process.env.TOKEN_SECRET;

function handleUndefinedAuthorizationHeader(req, res, next) {
  if (req.path == "/login") return next('route');
  if (req.path == "/token") return next('route');
  let authorizationHeader = req.get("Authorization");
  if (authorizationHeader == undefined) {
    res
      .status(401)
      .json({
        message: "Tidak ada Token"
      })
      return;
  }
  req.authorizationHeader = authorizationHeader;
  next();
}

function handleInvalidToken(req, res, next) {
  let authorizationHeader, receivedToken, decoded;
  authorizationHeader = req.authorizationHeader;
  try {
    receivedToken = authorizationHeader.split(" ")[1];
    decoded = jwt.verify(receivedToken, tokenSecret);
    return next();
  }
  catch (error) {
    let status;
    if (error.name == "TokenExpiredError") 
      status = 403;
    else 
      status = 401;

    res
      .status(status)
      .json({
        error: error,
        message: error.message
      })
  }
}

export default [handleUndefinedAuthorizationHeader, handleInvalidToken];
