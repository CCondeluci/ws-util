// config
const Community = require('./../config/community');

// imports
const request = require('request-promise-native');
const cheerio = require('cheerio');

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

/**
 * Gets price from Akanaide's YYT scraped DB
 * 
 * @param {string} cardId cardId
 * @return {String} card price
 */

module.exports.getJPPrice = async function (cardId) {
    // Get deck information from encoredecks
    let options = {
        url: Community.KUSA + '/' + cardId,
        json: true
    };
    let body = await request(options);
    // parse and index full html response
    let root = cheerio.load(body);
    // add price
    let price = root('.table').find("tr").last().find("td").last().text();

    return price;
}