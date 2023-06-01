let router = require('express').Router();
let services = require('./services');

// api endpoints
router.get("/refcards/:deckId", services.GetRefCards);
router.get("/price/jp/:deckId", services.GetYYTPrice);
router.get("/neosets", services.GetEncoreSets);

module.exports = router;