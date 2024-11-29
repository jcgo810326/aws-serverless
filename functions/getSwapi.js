const { generateUrl, transformOutput } = require("../helpers/validate");
const response = require("../helpers/response");
const { httpGet } = require("../helpers/http");
const { ErrorValidation } = require("../helpers/error");

/**
 * 
 * @param {*} event 
 */
exports.handler = async (event) => {

  try {

    let apigatewayUrl = 'https://' + event['headers']['Host'] + '/' + event['requestContext']['stage'] + '/' + process.env.APIGATEWAY_NAME_SWAPI + '/';
    let urlSwapi = generateUrl(event);
    let apiData = await httpGet(urlSwapi, "No existe mas datos para el recurso consultado.");
    let apiDataChanged = transformOutput(apiData.data, apigatewayUrl);
    return response(200, apiDataChanged);

  } catch (error) {
    /**
     * Almacena cualquier error en CloudWatch
     */
    console.log(error.message);
    console.log(error.stack);

    if (error instanceof ErrorValidation) {
      return response(404, { error: error.message });
    } else {
      return response(404, { error: "Ha ocorrido un inesperado error." });
    }

  }

};
