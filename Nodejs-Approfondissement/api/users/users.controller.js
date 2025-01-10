// require('module-alias/register');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const usersService = require("./users.service");
const User = require('./users.model'); // Vérifiez le chemin


class UsersController {
  // Méthode pour obtenir tous les utilisateurs
  async getAll(req, res, next) {
    try {
      const users = await usersService.getAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  // Méthode pour obtenir un utilisateur par son ID
  async getById(req, res, next) {
    try {
      const id = req.params.id;
      const user = await usersService.getById(id);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

 // Méthode pour créer un nouvel utilisateur
async create(req, res, next) {
  try {
    const user = await usersService.create(req.body);
    user.password = undefined; // Ne pas renvoyer le mot de passe
    req.io.emit("user:create", user);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

  

 // Méthode pour mettre à jour un utilisateur
async update(req, res, next) {
  try {
    const id = req.params.id;
    const data = req.body;

    // Pas besoin de hacher le mot de passe ici

    const userModified = await usersService.update(id, data);
    if (!userModified) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    userModified.password = undefined;
    res.json(userModified);
  } catch (err) {
    next(err);
  }
}
  // Méthode pour obtenir les articles d'un utilisateur
  async getUserArticles(req, res, next) {
    try {
      const userId = req.params.userId;
      const articles = await articlesService.getArticlesByUser(userId);
      res.status(200).json(articles);
    } catch (err) {
      next(err);
    }
  }

  // Méthode pour supprimer un utilisateur
  async delete(req, res, next) {
    try {
      const id = req.params.id;
      const deleted = await usersService.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }
      req.io.emit("user:delete", { id });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // Méthode pour la connexion
  async login(req, res, next) {
    try {
      console.log('Contenu de req.body :', req.body);
      let { email, password } = req.body;

      if (!email || !password) {
        console.error('Email ou mot de passe manquant.');
        return res.status(400).json({ message: "Email et mot de passe sont requis." });
      }

      console.log('Email fourni :', email);

      // Récupérer l'utilisateur
      const user = await usersService.getUserByEmail(email);
      if (!user) {
        console.error('Utilisateur non trouvé.');
        return res.status(401).json({ message: "Identifiants incorrects." });
      }

      // Comparer les mots de passe
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        console.error('Mot de passe incorrect.');
        return res.status(401).json({ message: "Identifiants incorrects." });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        config.secretJwtToken,
        { expiresIn: "3d" }
      );

      console.log('Connexion réussie. Token généré.');

      res.status(200).json({
        message: "Connexion réussie",
        token,
        role: user.role
      });
    } catch (err) {
      console.error('Erreur lors de la connexion :', err);
      next(err);
    }
  }
}

module.exports = new UsersController();
