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

module.exports.getRefCard = async function (cardCode, fileType) {
    try {
        var options = {
            url: HOTC.CARD_LIST_URL + cardCode + HOTC.SHORT_QUERY,
            json: true
        };
        let body = await request(options);
        console.log(body);
        // parse and index full html response
        let root = cheerio.load(body);
        // get img name and filetype
        let cardImg = root('img').attr('src');
        cardImg = cardImg.split('heartofthecards/images/cards/ws/')[1];
        // set the img link to true hotc
        root('img').first().attr('src', HOTC.IMG_URL + cardImg); //cardCode.replace('/', '-').toLowerCase() + '.gif');
        // recreate ref card from response
        let refCard = '<table width="400" style="border:1px solid black">' + root('table').html() + '</table>';
    
        return refCard;
    } catch (error) {
        console.log("REFCARD ERROR", cardCode, error);
    }
}