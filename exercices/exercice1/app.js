import express from "express";
const app = express();
import path from "path";
const __dirname = path.resolve();
import mongoose from "mongoose";
import { loadEnvFile } from "process";
loadEnvFile(".env");
import Articles from "./models/Articles.js";
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/exercice1-nodejs-doranco`).then().catch(err => console.error(err));

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "public", "home.html"));
});

app.get("/a-propos", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "public", "datas", "about.json"));
});

app.get("/api/datas/articles/init", async (req, res) => {
  try {
    await Articles.deleteMany({});

    await Articles.insertMany([
      {
        title: "Article 1",
        publicationDate: new Date,
        author: "Webdevoo",
        content: "Lorem ipsum sit dolor amet."
      },
      {
        title: "Article 2",
        publicationDate: new Date,
        author: "Webdevoo",
        content: "Conjectur imesis dolor sit amet."
      }
    ]);

    res.status(200).json({
      message: "Données initialisées"
    });
  } catch (err) {
    console.error(err);
  }
});

app.get("/articles/:articleId", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "public", "article.html"));
});

app.get("/api/datas/articles/:articleId", async (req, res) => {
  const articleId = req.params.articleId;
  
  const article = await Articles.findOne({_id: articleId})

  res.status(200).json(article);
});

app.post("/api/datas/articles", async (req, res) => {
  try{
    const articles = await Articles.find({});

    res.status(200).json(articles);
  }catch(err){
    console.error(err);
  }
});

app.use((req, res, next) => {
  res.status(404).send("Erreur 404");
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}.`);
  console.log(`Accès au projet : http://localhost:${PORT}.`);
});