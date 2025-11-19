const assert = require("assert"); // On va utiliser la dépendence d'assertion fournie par NodeJS
const mongoose = require("mongoose");
const { loadEnvFile } = require("node:process");
loadEnvFile();
const Response = require("../models/Response");

beforeEach(() => {
  mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/chatbot_nodejs`);
});

describe("Chatbot logic", function () {
  // Test pour vérifier si la réponse à la question "horaires" est correcte
  it("should return correct answer for 'horaires'", async function () {
    const matchingResponse = await Response.findOne({ question: "horaires" });

    assert.strictEqual(matchingResponse.answer, "Nous sommes ouverts du lundi au vendredi, de 09h00 à 17h00.");
  });

  // Test pour vérifier que si la question n'existe pas, il n'y a pas de réponse
  it("should not return a response for an unknown question", async function () {
    const matchingResponse = await Response.findOne({ question: "unknown" });

    assert.strictEqual(matchingResponse, null);
  });
});