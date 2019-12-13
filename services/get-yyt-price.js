'use strict';

/** 
 * @module GetYYTPrice
 */

// helpers
const EncoreDecks = require('./../helpers/encore');
const Community = require('./../helpers/community');

/**
 * Get YYT Price
 * 
 * Gets an estimate of a JP deck's price via YYT
 * 
 * @param {object} request HTTP request
 * @param {object} response HTTP response
 * @param {function} next function callback
 */

module.exports =  async (request, response, next) => {
    let deckId = request.params.deckId;
    try {
        // get deck from encore
        let parsedDeck = await EncoreDecks.getDeck(deckId);
        
        // sorry for this uwu
        let pricePromises = [];
        let priceOutput = {cards: [], total: 0};
        for (let card of parsedDeck) {
            pricePromises.push(new Promise(async function (resolve, reject) {
                try {
                    let returnCard = {};
                    // add price
                    returnCard.id = card.ws_code;
                    returnCard.quantity = card.ws_qty;
                    if (card.locale.EN.name) {
                        returnCard.name = card.locale.EN.name;
                    } else {
                        returnCard.name = card.locale.NP.name;
                    }
                    returnCard.price = await Community.getJPPrice(card.set + '/' + card.side + card.release + '-' + card.sid);
                    returnCard.combined = (parseFloat(returnCard.price) * card.ws_qty) + " ¥";
                    priceOutput.total += ((parseFloat(returnCard.price) * card.ws_qty));
                    resolve(returnCard);
                } catch (error) {
                    reject();
                }
            }));
        }
        // go get em
        let results = await Promise.all(pricePromises);
        priceOutput.cards = results;

        response.status(200).json(priceOutput);
    } catch (error) {
        response.status(500).json(priceOutput);
    }
}