'use strict';

/** 
 * @module GetRefCards
 */

// helpers
const EncoreDecks = require('./../helpers/encore');
const HotC = require('./../helpers/hotc');

/**
 * Get Reference Cards
 * 
 * Gets each invidual reference card HTML for a deck from HotC.
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
        // get ref cards from hotc and format
        let refcardHTML = '<html><head><meta name="google" content="notranslate"></head>' +
            '<style>div { page-break-inside:auto } ' + 
            'span { page-break-inside:avoid; page-break-after:auto }' +
            '</style><body><div>';
        let count = 0;
        for (let card of parsedDeck) {
            let refCard = await HotC.getRefCard(card.ws_code);
            if (count%2 == 0 ) {
                refCard = '<span style="display: flex">' + refCard
            } else {
                refCard = refCard + '</span>';
            }
            refcardHTML += refCard;
            count++;
        }
        refcardHTML += '</div></body></html>';
        response.status(200).send(refcardHTML);
    } catch (error) {
        response.status(500);
    }
}