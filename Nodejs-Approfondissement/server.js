// require('module-alias/register');
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
// const mongoose = require('mongoose');
const cors = require("cors");
const NotFoundError = require("./errors/not-found");
const usersRouter = require("./api/users/users.router");
const usersController = require("./api/users/users.controller");
const articlesRouter = require("./api/articles/articles.router");

const articleController = require("./api/articles/articles.controller");
const { authMiddleware, isAdmin } = require("./middlewares/auth");

const app = express(); 

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-access-token"],
  }
});

// Middleware pour analyser les corps des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "x-access-token"],
}));


// Middleware pour les websockets
io.on("connection", (socket) => {
  console.log("Un client est connecté");

  socket.on("disconnect", () => {
    console.log("Un client est déconnecté");
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Utilisation du routeur des utilisateurs

app.post('/login', usersController.login);
app.post('/api/users', usersController.create);
app.use("/api/users", usersRouter);
app.use('/api/articles', articlesRouter);

app.post('/api/articles',articleController.createArticle);

// Gestion des erreurs 404
app.use((req, res, next) => {
  next(new NotFoundError());
});

// Gestion des erreurs
app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message;
  res.status(status);
  res.json({ status, message });
});

module.exports = {
  app,
  server,
};