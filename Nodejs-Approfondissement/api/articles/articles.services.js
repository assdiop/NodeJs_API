 const Article = require('../articles/articles.schema');
 const mongoose = require('mongoose');

// Méthode pour créer un article
async function createArticle(data) {
  try {
    const newArticle = new Article({
      title: data.title,
      content: data.content,
      user: data.user,
      status: data.status || 'draft', // Par défaut à 'draft' si non spécifié
    });
    const savedArticle = await newArticle.save();
    return savedArticle;
  } catch (error) {
    throw new Error(`Erreur lors de la création de l'article: ${error.message}`);
  }
}

// Méthode pour mettre à jour un article
// async function updateArticle(articleId, updatedData) {
//   // Vérifier si l'ID est valide
//   if (!mongoose.Types.ObjectId.isValid(articleId)) {
    
//     t
// throw new Error('ID invalide');
//   }

//   // Convertir l'ID en ObjectId
//   const objectId = mongoose.Types.ObjectId(articleId);

//   // Mettre à jour l'article
//   const updatedArticle = await Article.findByIdAndUpdate(objectId, updatedData, { new: true });

//   return updatedArticle;
// }
async function updateArticle(id, data) {
  // Vérifiez qu'il n'y a pas de variable 't' non définie
  const updatedArticle = await Article.findByIdAndUpdate(id, data, { new: true });
  return updatedArticle;
}


async function getArticlesByUser(userId) {
  // Vérifiez que l'ID est bien un ObjectId valide
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('ID utilisateur invalide');
  }

  // Trouver les articles dont le champ 'user' correspond à 'userId'
  return await Article.find({ user: userId }).populate('user');
}



// Méthode pour supprimer un article
async function deleteArticle(articleId) {
  try {
    const deletedArticle = await Article.findByIdAndDelete(articleId);

    if (!deletedArticle) {
      throw new Error('Article non trouvé');
    }

    return deletedArticle;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression de l'article: ${error.message}`);
  }
}



module.exports = {
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByUser
};
