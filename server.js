require('dotenv').config();
const routes_lista = require('./routes/lista.router');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', false);
app.use('/liste', routes_lista);


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