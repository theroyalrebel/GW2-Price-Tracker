var express = require('express');
var app = express();
var totrack = require('./routes/totrack.js');
var bodyParser = require('body-parser');
var CronJob = require('cron').CronJob;
var mongo = require('./db/mongo');
var totrackDb = require('./db/totrack');
var request = require('request');
var email = require('./node_modules/emailjs/email');
var server = email.server.connect({
  user:    'gw2pricetracker@gmail.com', 
  password:'950711145978', 
  host:    'smtp.gmail.com', 
  ssl:     true
});

// Serve static pages
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('index');
});

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(urlencodedParser);

app.post('/submit', totrack);

new CronJob('1 * * * * *', function () {
  console.log('Starting Cronjob');
  // mongo.toTrack.remove({}, function (err, docs) {});
  mongo.toTrack.find({}, function (err, docs) {
    console.log(docs);
    for (var i = 0; i < docs.length; i++) {
      (function () {
        var itemName = docs[i].itemName;
        var itemId = docs[i].itemId;
        var itemPrice = docs[i].itemPrice;
        var buyOrSell = docs[i].buyOrSell;
        var email = docs[i].email;
        // var itemUrl = "https://api.guildwars2.com/v2/commerce/prices/" + itemId;
        var itemUrl = 'http://localhost:2000/' + itemId;
        request(itemUrl, function (error, response, body) {
          var result = JSON.parse(body);
          var sells = result.sells;
          var sellPrice = sells.unit_price;
          var currentItemSellValue = Number(sellPrice);
          var text = '';
          var subject = '';
          if (buyOrSell === 'sell') {
            if (currentItemSellValue >= itemPrice) {
              text = 'Hello! Your item ' + itemName + ' has risen to ' + currentItemSellValue;
              subject = '[GW2 Price Tracker] ' + itemName + ' has risen to ' + currentItemSellValue;
              server.send({
                text:    text,
                from:    'GW2 Price Tracker <gw2pricetracker@gmail.com>', 
                to:      email,
                subject: subject
              }, function (err, message) { 
                console.log(err || message); 
              });
              mongo.toTrack.remove({
                itemName : itemName,
                itemId: itemId,
                itemPrice: itemPrice,
                buyOrSell: buyOrSell,
                email: email}, function () {});
            }
          } else {
            if (currentItemSellValue <= itemPrice) {
              text = 'Hello! Your item ' + itemName + ' has fallen to ' + currentItemSellValue;
              subject = '[GW2 Price Tracker] ' + itemName + ' has fallen to ' + currentItemSellValue;
              server.send({
                text:    text,
                from:    'GW2 Price Tracker <gw2pricetracker@gmail.com>',
                to:      email,
                subject: subject
              }, function (err, message) { 
                console.log(err || message); 
              });
              mongo.toTrack.remove({
                itemName : itemName,
                itemId: itemId,
                itemPrice: itemPrice,
                buyOrSell: buyOrSell,
                email: email}, function () {});
            }
          }
        });
      })(i);
    }
  });
}, null, true, 'America/Los_Angeles');
module.exports = app;
app.listen(3000);