var express = require('express');
var router = express.Router();
var totrackDb = require('../db/totrack');
var request = require('request');

router.get('/submit', function (req, res) {
  res.render('addtotrack');
});

router.post('/submit', function (req, res, next) {
  if (req.body.itemName && req.body.itemPrice && req.body.buyOrSell && req.body.email) {
    var itemUrl = 'https://www.gw2shinies.com/api/json/idbyname/' + req.body.itemName;
    var itemId = 0;
    var result;
    request(itemUrl, function (error, response, body) {
      result = JSON.parse(body); 
      var firstResult = result[0];
      var jsonItemId = firstResult.item_id;
      itemId = Number(jsonItemId);
      totrackDb.addToTrack({ 
        itemName: req.body.itemName,
        itemId: itemId, 
        itemPrice: Number(req.body.itemPrice),
        buyOrSell: req.body.buyOrSell,
        email: req.body.email
      }, function (error) {
        if (error) {
          next(error);
        } else {
          res.send('Your item has been saved');
        }
      });
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router;