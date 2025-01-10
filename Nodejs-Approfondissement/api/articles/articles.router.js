const express = require('express');
const router = express.Router();
const articlesController = require('./articles.controller.js');
const { authMiddleware, isAdmin } = require('../../middlewares/auth'); // Modification ici

// Route pour créer un nouvel article (tout utilisateur connecté peut créer un article)
router.post('/', authMiddleware, articlesController.createArticle);

// Route pour mettre à jour un article (seulement pour les administrateurs)
router.put('/:id', authMiddleware, isAdmin, articlesController.updateArticle);

// Route pour supprimer un article (seulement pour les administrateurs)
router.delete('/:id', authMiddleware, isAdmin, articlesController.deleteArticle);

// Route pour obtenir les articles d'un utilisateur spécifique
router.get('/user/:userId', articlesController.getUserArticles);

module.exports = router;
