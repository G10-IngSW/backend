const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ListaSchema = new Schema({
  titolo: {
    type: String,
    required: true,
  },
  oggetti: {
    type: [String], 
    default: [], 
  },
  idAccount: {
    type: Schema.Types.ObjectId,
    ref: 'utenti',   
    required: true,
  },
  dataUltimaModifica: {
    type: Date,
    default: Date.now(), // PRIMA ERA default: Date.now e funzionava
    required: true,
  },
}, {
  collection: 'liste',
  versionKey: false,
});

module.exports = mongoose.model('Lista', ListaSchema);