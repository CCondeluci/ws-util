// config
const Encore = require('./../config/encore');

// imports
const request = require('request-promise-native');

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

/**
 * Get Decklist from Encore API
 * 
 * @param {string} deckId deckId
 * @return {Array} parsed deck of unique cards
 */

module.exports.getDeck = async function (deckId) {
    // Get deck information from encoredecks
    let options = {
        url: Encore.URL + '/api/deck/' + deckId,
        json: true
    };
    let returnedDeck = await request(options);

    // Set quantities and code from encoredecks
    let parsedDeck = [];
    for (let card of returnedDeck.cards) {
        let findIndex = parsedDeck.findIndex(obj => obj._id == card._id);
        if (findIndex < 0) {
            card.ws_code = card.set + '/' + card.side + card.release + '-' + card.sid;
            card.ws_qty = 1;
            parsedDeck.push(card);
        } else {
            parsedDeck[findIndex].ws_qty += 1;
        }
    };

    return parsedDeck;
}