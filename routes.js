let router = require('express').Router();
let services = require('./services');

// api endpoints
router.get("/refcards/:deckId", services.GetRefCards);

module.exports = router;