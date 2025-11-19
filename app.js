// On importe la dépendance express
// const { loadEnvFile } = require("node:process");
// loadEnvFile(".env");
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const path = require("path");
const mongoose = require("mongoose");
const Response = require("./models/Response");
const http = require("http");
const {Server} = require("socket.io");

// On définit les ressources que le serveur a le droit d'utiliser.
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // On autorise ici le serveur à lire les données JSON dans le corps des requêtes
app.set('trust proxy', true);

// On connecte mongoDb avec mongoose
// mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/chatbot_nodejs`)
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/chatbot_nodejs?appName=Cluster0`)
  .then(() => console.log("Connecté à la base de données MongoDB."))
  .catch(err => console.error(`Erreur de connexion à la base de données : ${err}.`));

// On créé le serveur HTTP dédié à socket.io
const server = http.createServer(app);
const io = new Server(server);

// On définit une route pour la d'accueil
app.get("/", (req, res) => {
  console.log(`Bienvenue ${req.ip} !`);
  console.table(localStorage);
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

// Cette route est à appeler une seule fois pour initialiser notre modèle de données.
app.get("/api/init", async (req, res) => {
  try {

    // On supprime toutes les réponses existantes de notre base de données
    await Response.deleteMany({});

    // On insère nos jeux de données par défaut
    await Response.insertMany([
      {
        question: "horaires",
        answer: "Nous sommes ouverts du lundi au vendredi, de 09h00 à 17h00."
      },
      {
        question: "retours",
        answer: "Vous pouvez retourner un article dans les 30 jours suivant la date d'achat."
      },
      {
        question: "contact",
        answer: "Vous pouvez nous contacter par email à l'adresse contact@example.com ou par téléphone au 01 23 45 67 89."
      }
    ]);

    res.status(200).json({
      message: "Des données ont été initialisées avec succès !"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// On va ajouter une route à l'API de notre chatbot
app.get("/api/chat", async (req, res) => {
  const response = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: "horaires" })
  });

  const datas = await response.json();

  res.json(datas);
});

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message.toLowerCase();

  let botResponse = {
    text: "Désolé, je n'ai pas compris votre question..."
  };

  try {

    // On cherche une réponse qui correspond à la question de l'utilisateur
    const matchingResponse = await Response.findOne({
      question: userMessage
    });

    if (matchingResponse) {
      botResponse.text = matchingResponse.answer;
    }

    res.status(200).json(botResponse);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.use((req, res, next) => {
  res.status(404).json({
    confirm: "true error",
    error: "Erreur 404"
  });
});

// On écoute les connexions aux webSockets
io.on("connection", (socket)=>{
  console.log("Un utilisateur s'est connecté.");

  // Écouter les émissions de type "chat message" qui proviennent du client
  socket.on("chat message", async (userMessage) => {
    userMessage = userMessage.toLowerCase();
    let botResponse = "Désolé, je n'ai pas compris votre question";

    try{
      const matchingResponse = await Response.findOne({question: userMessage});
      if(matchingResponse){
        botResponse = matchingResponse.answer;
      }
    }catch(err){
      console.error(err);
      botResponse = "Oups, il y a eu un problème...";
    }

    // On envoie la réponse au client
    socket.emit("chat message", botResponse);
  });

  socket.on("disconnect", () => {
    console.log("Un utilisateur s'est déconnecté.");
  });
});

// On démarre le serveur sur le port 3000 ou le port fourni par un fichier d'environnement et on va écouter ce port
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}.`);
  console.log(`Accédez à l'url http://localhost:${PORT}`);
  console.log(`Accédez à l'url http://jadenya.fr/chatbot_nodejs`);
});