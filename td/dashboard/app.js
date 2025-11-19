import express from "express";
const app = express();
import http from "http";
import { Server } from "socket.io";
const PORT = 3000;
import path from "path";
const __dirname = path.resolve();



app.use(express.static(path.join(__dirname, "public")));
app.set('trust proxy', true)

function generateRandomDatas() {
  const randomNumber = Number((Math.random() * 100).toFixed(0));
  const datas = {
    productAStock: randomNumber,
    statusService: randomNumber
  };

  return datas;
}

const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  console.log(`Bienvenue ${req.ip} !`);
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

setInterval(() => {
  io.emit("new datas", generateRandomDatas());
}, 3000);

io.on("connection", (socket) => {
  console.log("Utilisateur connecté");

  // Attention, placé dans cet événement, le setInterval se lancera x fois par nombre d'utilisateurs.
  // Par exemple : 5 utilisateurs = 5 lancements par décompte.

  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté");
  });
});

server.listen(PORT, () => {
  console.log(`Serveur connecté au port ${PORT}.`);
  console.log(`Accès : http://localhost:${PORT}.`);
});