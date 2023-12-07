const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const OggettiListeSchema = new Schema({
  oggetti: {
    type: [String], 
    default: [], 
  },
  idAccount: {
    type: Schema.Types.ObjectId,
    ref: 'utenti',   
    required: true,
  },
}, {
  collection: 'oggettiListe',
  versionKey: false,
});

module.exports = mongoose.model('OggettiListe', OggettiListeSchema);