import router from "./routes/index.js";
import express from "express";
import "dotenv/config";

const app = express();
app.use(express.json());

app.use(router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});
