// articles.spec.js

const request = require("supertest");
const { app } = require("../server");
const jwt = require("jsonwebtoken");
const config = require("../config");
const mongoose = require("mongoose");
const mockingoose = require("mockingoose");
const Article = require("../api/articles/articles.schema");
const User = require('../api/users/users.model');

const mockUSER_ID = mongoose.Types.ObjectId().toHexString();
const mockARTICLE_ID = mongoose.Types.ObjectId().toHexString();

// Mock du module auth
jest.mock('../middlewares/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = {
      _id: mockUSER_ID,
      role: 'admin',
    };
    next();
  },
  isAdmin: (req, res, next) => next(),
}));

describe("Articles API", () => {
  let token;

  const fakeUser = {
    _id: mockUSER_ID,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  };

  beforeEach(() => {
    token = jwt.sign({ id: mockUSER_ID }, config.secretJwtToken);

    // Mock de User.findById pour le middleware d'authentification
    mockingoose(User).toReturn(fakeUser, 'findOne');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockingoose.resetAll();
  });

  test("should create a new article", async () => {
    const newArticle = {
      _id: mockARTICLE_ID,
      title: "Mon Nouvel Article",
      content: "Ceci est le contenu de mon article.",
      user: mockUSER_ID,
      status: "published",
    };

    mockingoose(Article).toReturn(newArticle, "save");

    const res = await request(app)
      .post("/api/articles")
      .set("x-access-token", token)
      .send({
        title: "Mon Nouvel Article",
        content: "Ceci est le contenu de mon article.",
        status: "published",
      });

    console.log('Status:', res.status);
    console.log('Body:', res.body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe(newArticle.title);
    expect(res.body.content).toBe(newArticle.content);
    expect(res.body.user).toBe(mockUSER_ID);
    expect(res.body.status).toBe(newArticle.status);
  });

  test("should update an existing article", async () => {
    const updatedArticle = {
      _id: mockARTICLE_ID,
      title: "Article Mis à Jour",
      content: "Contenu mis à jour.",
      user: mockUSER_ID,
      status: "published",
    };

    mockingoose(Article).toReturn(updatedArticle, "findOneAndUpdate");

    const res = await request(app)
      .put(`/api/articles/${mockARTICLE_ID}`)
      .set("x-access-token", token)
      .send({
        title: "Article Mis à Jour",
        content: "Contenu mis à jour.",
      });

    console.log('Status:', res.status);
    console.log('Body:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(updatedArticle.title);
    expect(res.body.content).toBe(updatedArticle.content);
  });

  test("should delete an existing article", async () => {
    const deletedArticle = {
      _id: mockARTICLE_ID,
      title: "Mon Nouvel Article",
      content: "Ceci est le contenu de mon article.",
      user: mockUSER_ID,
      status: "published",
    };

    mockingoose(Article).toReturn(deletedArticle, "findOneAndDelete");

    const res = await request(app)
      .delete(`/api/articles/${mockARTICLE_ID}`)
      .set("x-access-token", token);

    console.log('Status:', res.status);
    console.log('Body:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Article supprimé avec succès");
    expect(res.body.deletedArticle._id).toBe(mockARTICLE_ID);
  });
});
