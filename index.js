import express from "express";
import apiRouter from "./apiRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(compression());
app.use(express.static(path.join(__dirname, 'assets')));
app.use('/api', apiRouter);
app.use('/assets', express.static(path.join(__dirname, 'assets')));


app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.listen(port, async () => {
  // await Akun.sync()
  // await Blok.sync()
  // await DetailBlok.sync()
  // await Keluarga.sync()
  // await Sumbangan.sync()
}); 