const User = require("./users.model");
const bcrypt = require("bcrypt");
const userModel= require('./users.model');
class UsersService {
  // Obtenir tous les utilisateurs
  async getAll() {
    return await User.find().select('-password');
  }

  // Obtenir un utilisateur par ID
  async getById(id) {
    return await User.findById(id).select('-password');
  }

  // Créer un nouvel utilisateur
  async create(data) {
    const user = new User(data);
    return await user.save();
  }

  // Mettre à jour un utilisateur
  async update(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
  }

  // Supprimer un utilisateur
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  // Obtenir un utilisateur par email
  async getUserByEmail(email) {
    return await User.findOne({ email });
  }
}



module.exports = new UsersService();

