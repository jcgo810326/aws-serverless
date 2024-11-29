const axios = require('axios');
const { ErrorValidation } = require("./error");

/**
 * 
 * @param {*} url 
 * @param {*} errorMessage 
 */
async function httpGet(url, errorMessage) {
    try {
        return await axios.get(url);
    } catch (error) {
        throw new ErrorValidation(errorMessage, error.stack);
    }
}

module.exports = {
    httpGet
}