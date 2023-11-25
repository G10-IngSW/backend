require('dotenv').config();
const routes_lista = require('./routes/lista.router');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); 
app.use(cors()); // permetto che si facciano richieste da qualunque indirizzo
mongoose.set('strictQuery', false);
app.use(express.json());

app.use('/liste', routes_lista);

const PORT = process.env.PORT || 3000;

const connectToDB = async() => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME, 
    });
    console.log(`MongoDB connesso: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(`In ascolto sulla porta ${PORT}`);
  });
});