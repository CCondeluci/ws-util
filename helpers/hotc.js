// config
const HOTC = require('./../config/hotc');

// imports
const request = require('request-promise-native');
const cheerio = require('cheerio');

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

/**
 * Get Ref Card from HOTC
 * 
 * @param {string} cardCode WS card code
 * @return {String} HTML of ref card as displayed exactly by HOTC
 */

module.exports.getRefCard = async function (cardCode) {
    var options = {
        url: HOTC.CARD_LIST_URL + cardCode + HOTC.SHORT_QUERY,
        json: true
    };
    let body = await request(options);
    // parse and index full html response
    let root = cheerio.load(body);
    // set the img link to true hotc
    root('img').attr('src', HOTC.IMG_URL + cardCode.replace('/', '-').toLowerCase() + '.gif');
    // recreate ref card from response
    let refCard = '<table width="400" style="border:1px solid black">' + root('table').html() + '</table>';

    return refCard;
}