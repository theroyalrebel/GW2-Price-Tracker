var mongoose = require('mongoose');
var request = require('request');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

var toTrackSchema = new mongoose.Schema({
  itemName: String,
  itemId: Number,
  itemPrice: Number,
  buyOrSell: String,
  email: String
});
  
var toTrack = mongoose.model('toTrack', toTrackSchema);

module.exports = {
  toTrack: toTrack,
  mongoose: mongoose,
  db: db.collection('toTrack')
};