// config
const Encore = require('./../config/encore');

// imports
const request = require('request-promise-native');

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// Sorts a deck by level, cost, type
const colorSort = ['YELLOW', 'GREEN', 'RED', 'BLUE', 'PURPLE'];
const customSort = ({data, sortBy, sortField}) => {
    const sortByObject = sortBy.reduce(
    (obj, item, index) => ({
        ...obj,
        [item]: index
    }), {})
    return data.sort((a, b) => sortByObject[a[sortField]] - sortByObject[b[sortField]])
}
const cmp = (a,b) => (a > b) - (a < b);
const lvlCostCompare = (a, b) => { 
    return cmp(a.level,b.level) || cmp(a.cost,b.cost)
}

const sort = (parsedDeck) => {
    let lvl0 = [];
    let lvl1 = [];
    let lvl2 = [];
    let lvl3 = [];
    let event = [];
    let cx = [];

    // first, sort deck by color
    parsedDeck = customSort({data: parsedDeck, sortBy: colorSort, sortField:'colour'});

    // group cards by type and level
    for(let card of parsedDeck) {
        if (card.cardtype == "CX") {
            cx.push(card);
        }
        else if (card.cardtype == "EV") {
            event.push(card);
        }
        else if (card.cardtype == "CH") {
            if (card.level == 0) {
                lvl0.push(card);
            }
            else if (card.level == 1) {
                lvl1.push(card);
            }
            else if (card.level == 2) {
                lvl2.push(card);
            }
            else if (card.level == 3) {
                lvl3.push(card);
            }
        }
    }

    // sort each subarray
    lvl0.sort(lvlCostCompare);
    lvl1.sort(lvlCostCompare);
    lvl2.sort(lvlCostCompare);
    lvl3.sort(lvlCostCompare);
    event.sort(lvlCostCompare);

    // concatenate arrays
    let resultDeck = lvl0.concat(lvl1.concat(lvl2).concat(lvl3).concat(event).concat(cx));

    return resultDeck;
}

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

    // Sort deck
    parsedDeck = sort(parsedDeck);

    return parsedDeck;
}