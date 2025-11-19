const mongoose = require("mongoose");

// On définit le schéma de notre modèle de données
// Une question ou une réponse sera représentée par un type String
const responseSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Response", responseSchema);