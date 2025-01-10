// auth.js

const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../api/users/users.model");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token) {
      return res.status(401).json({ message: "Aucun token fourni. Veuillez vous authentifier." });
    }

    const decoded = jwt.verify(token, config.secretJwtToken);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé. Veuillez vous authentifier." });
    }

    req.user = user; // Attacher toutes les informations de l'utilisateur
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré. Veuillez vous reconnecter." });
  }
};

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé. Réservé aux administrateurs." });
  }
  next();
};

// Exporter les middlewares sous forme d'objet
module.exports = {
  authMiddleware,
  isAdmin,
};
