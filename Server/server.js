import "dotenv/config";// aggiunto da luigi
import express from "express";
import cors from "cors";
import path from "path";
import { connectDB } from "./Config/db.js";

// routes
import ItemRoutes from "./Routes/ItemRoutes.js";
import VisitRoutes from "./Routes/VisitRoutes.js";
import MuseumRoutes from "./Routes/MuseumRoutes.js";

const app = express();

// fix __dirname per ES modules
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);;

// connessione a Mongo
await connectDB();

// middleware
app.use(cors());
app.use(express.json());

// API
app.use("/api/items", ItemRoutes);
app.use("/api/visits", VisitRoutes);
app.use("/api/museums", MuseumRoutes);

// SERVIRE IL FRONTEND
app.use(express.static(path.join(__dirname, "../MarketPlace-Editor")));

// SERVIRE IL NAVIGATOR VUE luigi: farà servire la build del mio client Vue 
// da:http://localhost:8001/navigator/
app.use(
  "/navigator",
  express.static(path.join(__dirname, "public", "navigator"))
);

// homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../MarketPlace-Editor/Index.html"));
});

// luigi: fallback per le route interne del Navigator Vue
app.get("/navigator/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "navigator", "index.html"));
});

// avvio server
//app.listen(8001, () => {
//    console.log("Server running on port 8001");
//});

//luigi
const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//le modificheaggiungono la possibilità di servire il Navigator Vue dentro /navigator/.