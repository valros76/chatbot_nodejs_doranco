import mongoose from "mongoose";

const articlesSchema = new mongoose.Schema({
  title: String,
  publicationDate: Date,
  author: String,
  content: String
});

export default mongoose.model("Articles", articlesSchema);