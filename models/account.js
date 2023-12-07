const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const AccountSchema = new Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String, 
    required: true, 
  },
  password: {
    type: String,
    required: true,
  },
}, {
  collection: 'utenti',
  versionKey: false,
});

module.exports = mongoose.model('Account', AccountSchema);