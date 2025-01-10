// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé. Réservé aux administrateurs." });
    }
    next();
  };
  
  module.exports = isAdmin;
  