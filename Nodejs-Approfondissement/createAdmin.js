// createAdminUser.js

const mongoose = require('mongoose');
const User = require('./api/users/users.model'); // Ajustez le chemin si nécessaire

async function createAdminUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/myapp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à la base de données');

    const existingUser = await User.findOne({ email: 'admin@example.com' });
    if (existingUser) {
      console.log("L'utilisateur admin existe déjà.");
      return;
    }

    // Ne hachez pas le mot de passe ici
    const user = new User({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'passer123', // Mot de passe en clair
      role: 'admin',
    });

    await user.save();
    console.log('Utilisateur admin créé avec succès.');
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur admin :", error);
  } finally {
    await mongoose.connection.close();
  }
}

createAdminUser();
