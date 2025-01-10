const express = require("express");
const router = express.Router();
const usersController = require("./users.controller");
const { authMiddleware, isAdmin } = require("../../middlewares/auth");

// Route publique pour la connexion
router.post('/login', usersController.login);

// Appliquer le middleware d'authentification à partir d'ici
router.use(authMiddleware);

// Routes accessibles aux utilisateurs authentifiés

// **Routes statiques en premier**
router.get('/', usersController.getAll);
router.post('/', usersController.create);

// Route publique pour obtenir les articles d'un utilisateur
router.get('/:userId/articles', usersController.getUserArticles);

// **Routes pour les administrateurs**
router.get('/admin/users', isAdmin, usersController.getAll);
router.get('/admin/users/:id', isAdmin, usersController.getById);
router.post('/admin/users', isAdmin, usersController.create);
router.put('/admin/users/:id', isAdmin, usersController.update);
router.delete('/admin/users/:id', isAdmin, usersController.delete);

// **Routes dynamiques avec validation d'ID**
router.get('/:id([0-9a-fA-F]{24})', usersController.getById);
router.put('/:id([0-9a-fA-F]{24})', usersController.update);
router.delete('/:id([0-9a-fA-F]{24})', usersController.delete);

module.exports = router;
