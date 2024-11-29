/**
 * 
 * @param {*} status 
 * @param {*} data 
 */
const response = (status, data) => {
    return {
        statusCode: status,
        body: JSON.stringify(data),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
    };
}

module.exports = response;