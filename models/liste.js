const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ListaSchema = new Schema({
  titolo: {
    type: String,
    required: true,
  },
  elementi: {
    type: [String], 
    default: [], 
  },
  idUtente: {
    type: Schema.Types.ObjectId,
    ref: 'utenti',   
    required: true,
  },
}, {
  collection: 'liste'
});

module.exports = mongoose.model('Lista', ListaSchema);