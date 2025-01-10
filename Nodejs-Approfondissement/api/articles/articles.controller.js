const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const articleService = require('./articles.services.js'); // Importation des services d'articles
const User = require('./articles.schema'); // Vérifiez le chemin


// fonction pour creer un article 
async function createArticle(req, res) {
  try {
    // Check if req.user._id is defined
    if (!req.user || !req.user._id) {
      console.log('Utilisateur non authentifié');
      console.log('Contenu de req.body :', req.body);
      return res.status(400).json({ message: "L'ID de l'utilisateur est requis." });
    }

    console.log("Utilisateur authentifié :", req.user);
    console.log("Données de l'article :", req.body);

    const articleData = {
      ...req.body,
      user: req.user._id, // Use req.user._id
    };

    const newArticle = await articleService.createArticle(articleData);
    res.status(201).json(newArticle);

    // Emit event via Socket.IO if necessary
    if (req.io) {
      req.io.emit('articleCreated', newArticle);
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'article :", error.message);
    res.status(500).json({ message: `Erreur lors de la création de l'article : ${error.message}` });
  }
}

// Fontion pour mise à jour

async function updateArticle(req, res) {
  try {
    // Vérification du rôle de l'utilisateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Accès refusé : vous devez être un administrateur pour modifier cet article." });
    }

    console.log('req.params:', req.params);
    console.log('Type de req.params.id :', typeof req.params.id);

    const articleId = req.params.id;
    if (!articleId) {
      return res.status(400).json({ message: "ID de l'article non fourni." });
    }

    const updatedData = { ...req.body };
    // Supprimer le champ 'user' si présent
    delete updatedData.user;

    console.log('Données reçues pour la mise à jour :', updatedData);

    const updatedArticle = await articleService.updateArticle(articleId, updatedData);

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    res.status(200).json(updatedArticle);

    // Émettre un événement via Socket.IO pour signaler la mise à jour de l'article
    if (req.io) {
      req.io.emit('articleUpdated', updatedArticle);
    }
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      res.status(400).json({ message: `Données invalides : ${error.message}` });
    } else {
      res.status(500).json({ message: `Erreur lors de la mise à jour de l'article : ${error.message}` });
    }
  }
}


// Méthode pour supprimer un article
async function deleteArticle(req, res) {
  try {
    // Vérification du rôle de l'utilisateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Accès refusé : vous devez être un administrateur pour supprimer cet article." });
    }

    const articleId = req.params.id; // Récupérer l'ID de l'article à partir des paramètres de la requête
    const deletedArticle = await articleService.deleteArticle(articleId);

    if (!deletedArticle) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    res.status(200).json({ message: "Article supprimé avec succès", deletedArticle });

    // Émettre un événement via Socket.IO pour signaler la suppression de l'article
    if (req.io) {
      req.io.emit('articleDeleted', deletedArticle);
    }
  } catch (error) {
    res.status(500).json({ message: `Erreur lors de la suppression de l'article : ${error.message}` });
  }
}

// Méthode pour obtenir les articles d'un utilisateur
async function getUserArticles(req, res, next) {
  try {
    const userId = req.params.userId;
    const articles = await articleService.getArticlesByUser(userId);
    res.status(200).json(articles);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createArticle,
  updateArticle,
  deleteArticle,
  getUserArticles, // Assurez-vous d'exporter cette méthode si elle est utilisée
};