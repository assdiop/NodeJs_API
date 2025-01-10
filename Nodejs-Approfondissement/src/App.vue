<template>
  <main class="container">
    <div id="app">
      <article class="grid" v-if="layout == 'login'">
        <div>
          <hgroup>
            <h1>Connexion</h1>
            <h2>Bienvenue sur notre application</h2>
          </hgroup>
          <form @submit.prevent="login">
            <input type="text" name="email" placeholder="Email" aria-label="Email" autocomplete="nickname" required v-model="email">
            <input type="password" name="password" placeholder="Mot de passe" aria-label="Mot de passe" autocomplete="current-password" required v-model="password">
            <button class="contrast">Se connecter</button>
          </form>
        </div>
      </article>
      <article v-else>
        <h1>Créer un utilisateur</h1>
        <form @submit.prevent="create">
          <input type="text" placeholder="Nom" required v-model="newUser.name">
          <input type="text" placeholder="Email" required v-model="newUser.email">
          <input type="password" placeholder="Mot de passe" required v-model="newUser.password">
          <button class="contrast">Créer</button>
        </form>
        <h1>Utilisateurs existants</h1>
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Nom</th>
              <th scope="col">Email</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td>{{ user._id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td><button @click="remove(user._id)">Supprimer</button></td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>
  </main>
</template>

<script>
import { io } from 'socket.io-client';
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      layout: 'login',
      email: '',
      password: '',
      users: [],
      newUser: {
        name: '',
        email: '',
        password: ''
      },
      userToken: '',
      socket: null
    };
  },
  mounted() {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erreur de connexion Socket.IO :', error);
    });

    this.socket.on('disconnect', () => {
      console.warn('Déconnecté du serveur Socket.IO');
    });

    this.load();

    const role = localStorage.getItem('role');
    if (role === 'admin') {
      console.log("Fonctionnalités administrateur disponibles");
      // Active les fonctionnalités réservées à l'admin
    }
  },
  methods: {
    async login() {
  try {
    console.log('Email saisi :', this.email);
    console.log('Mot de passe saisi :', this.password);

    const response = await axios.post('http://localhost:3000/api/users/login', {
      email: this.email,
      password: this.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const { token, role } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);

    console.log('Connexion réussie. Token reçu :', token);
    this.load();
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    alert("Connexion échouée. Veuillez vérifier vos identifiants.");
  }
},

   async load() {
  try {
    this.userToken = localStorage.getItem('token');
    console.log('Token utilisateur :', this.userToken);

    if (this.userToken) {
      this.layout = 'list';
      const users = await axios.get('http://localhost:3000/api/users', {
        headers: {
          'x-access-token': this.userToken
        }
      }).then(res => res.data);
      this.users = users;

      // Gestion des événements Socket.IO
      this.socket.on('user:create', (data) => {
        this.users.push(data);
      });

      this.socket.on('user:delete', (data) => {
        this.users = this.users.filter(user => user._id != data.id);
      });
    } else {
      this.layout = 'login';
    }
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs :', error);
    alert('Session expirée ou invalide, veuillez vous reconnecter.');
    localStorage.removeItem('token');
    this.layout = 'login';
  }
},

  async remove(userId) {
  try {
    await axios.delete(`http://localhost:3000/api/users/${userId}`, {
      headers: {
        'x-access-token': this.userToken
      }
    });
    // Mettre à jour la liste des utilisateurs localement
    this.users = this.users.filter(user => user._id !== userId);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur :', error);
  }
},

  async create() {
  try {
    const response = await axios.post('http://localhost:3000/api/users', this.newUser, {
      headers: {
        'x-access-token': this.userToken
      }
    });
    console.log("Utilisateur créé avec succès:", response.data);
    // Ne pas ajouter l'utilisateur ici, le gestionnaire Socket.IO s'en chargera
    // this.users.push(response.data);
    // Réinitialiser le formulaire
    this.newUser = {
      name: '',
      email: '',
      password: ''
    };
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur:", err);
    alert('Impossible de créer un utilisateur. Veuillez vérifier les informations saisies.');
  }
},

  }
}

</script>

<style>
@import 'https://unpkg.com/@picocss/pico@latest/css/pico.min.css';

/* Vos styles supplémentaires ici */
</style>
