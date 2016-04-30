var mongo = require('./mongo');

module.exports = {
  addToTrack: function (toTrackData, callback) {
    var totrack = new mongo.toTrack(toTrackData);
    totrack.save(function (error) {
      if (error) {
        console.log(error);
      }
      callback(error);
    })
  }
};
