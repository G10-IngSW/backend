require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes_lista = require('./routes/lista.router');
const routes_account = require('./routes/account.router');
const routes_oggetti = require('./routes/oggetti.router');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
app.use(cors()); 
mongoose.set('strictQuery', false);

app.use(express.json());
app.use('/liste', routes_lista);
app.use('/account', routes_account);
app.use('/oggetti', routes_oggetti)

const PORT = process.env.PORT || 3000;
const swaggerDocument = YAML.load('./doc/PricePalDocs.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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