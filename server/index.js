const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config({ debug: true }); // if you want more dotenv logs


console.log('URI:', process.env.MONGO_URI); // or however you build it

const app = express();
app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

app.get("/", (req, res) => res.send("API running"));

app.listen(process.env.PORT || 5000, () =>
  console.log("Server started")
);
