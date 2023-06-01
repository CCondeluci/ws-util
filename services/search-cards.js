'use strict';

/** 
 * @module GetRefCards
 */

// helpers
const EncoreDecks = require('../helpers/encore');

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
    try {
        // get deck from encore
        let neosets = await EncoreDecks.searchCards();
        
        response.status(200).json(neosets);
    } catch (error) {
        response.status(500);
    }
}