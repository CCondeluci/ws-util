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

/**
 * Get Sets from Encore API
 * 
 * @return {Array} parsed deck of unique cards
 */

module.exports.getSets = async function () {
    // Get set information from encoredecks
    let options = {
        url: Encore.URL + '/api/neosets',
        json: true
    };
    let sets = await request(options);

    // Get JP & EN Series Lists
    options = {
        url: Encore.URL + '/api/serieslist/JP',
        json: true
    };
    let jpSeries = await request(options);
    options = {
        url: Encore.URL + '/api/serieslist/EN',
        json: true
    };
    let enSeries = await request(options);

    // sort the neo-standard sets
    sets.sort((a, b) => (a.name > b.name) ? 1 : -1)

    // loop through each list of jp & en and collapse releases to sets
    for (let set of sets) {
        set.jp = [];
        for (let releaseCode of set.setcodes) {
            let matchedJP = jpSeries.filter(x => x.set == releaseCode)
            set.jp.push(...matchedJP);
        }
        set.en = [];
        for (let releaseCode of set.setcodes) {
            let matchedEN = enSeries.filter(x => x.set == releaseCode)
            set.en.push(...matchedEN);
        }
    }

    return sets;
}

/**
 * Search cards given obj from Encore API
 * 
 * @return {Array} parsed deck of unique cards
 */

module.exports.searchCards = async function (searchObj) {
    let cards = [];
    let promiseArr = [];
    for (let enSeries of searchObj.selectedSet.en) {
        promiseArr.push(new Promise(async function (resolve, reject) {
            let options = {
                url: Encore.URL + 'api/series/' + enSeries._id + '/cards',
                json: true
            };
            let result = await request(options);
            cards.push(...result);
            resolve();
        }));
    }

    for (let jpSeries of searchObj.selectedSet.jp) {
        promiseArr.push(new Promise(async function (resolve, reject) {
            let options = {
                url: Encore.URL + 'api/series/' + jpSeries._id + '/cards',
                json: true
            };
            let result = await request(options);
            cards.push(...result);
            resolve();
        }));
    }

    return cards;
}

/**
 * Build HotC-style reference card HTML but for community TLs
 * 
 * @param {Object} card single card as returned by Encoredecks API for a call to getDeck
 * @return {String} html for a single reference card
 */
module.exports.getCommunityRefCard = function(card) {
    // base html table to mirror HotC, want them to look similar
    refCardString = '<table width="100%" style="border:1px solid black">';
    refCardString += '<tbody><tr><td colspan="3"><b>';
    // card name
    if (card.locale.EN.name) {
        refCardString += card.ws_code + ' &nbsp; ' + card.locale.EN.name + '</b><br>';
    } else {
        refCardString += card.ws_code + ' &nbsp; ' + card.locale.NP.name + '</b><br>';
    }
    // traits
    if (card.locale.EN.attributes.length > 0) {
        for (let trait of card.locale.EN.attributes) {
            refCardString += trait + ', ';
        }
    } else {
        for (let trait of card.locale.NP.attributes) {
            refCardString += trait + ', ';
        }
    }
    refCardString = refCardString.slice(0, -2);
    // image
    refCardString += '</td></tr><tr><td style="padding-right: 1em;"><img width="131px" src="';
    refCardString += 'https://www.encoredecks.com/images/' + card.imagepath + '">';
    refCardString += '</td><td style="vertical-align: top;">';
    // effects
    if (card.locale.EN.ability.length > 0) {
        for (let ability of card.locale.EN.ability) {
            refCardString += ability + '<br>';
        }
    } else {
        for (let ability of card.locale.NP.ability) {
            refCardString += ability + '<br>';
        }
        refCardString += '<br><i>(No translation for this card exists in Encoredeck\'s community database.)</i><br>'
    }
    refCardString = refCardString.slice(0, -4);
    refCardString += '</td></tr></tbody></table>';

    return refCardString;
}