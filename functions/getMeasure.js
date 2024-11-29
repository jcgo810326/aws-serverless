const response = require("../helpers/response");
const { validateInputMeasureGet, transformOutputMeasure } = require("../helpers/validate");
const { getMeasureFromDynamoInterval, getMeasureFromDynamoToken } = require("../helpers/dynamo");
const { ErrorValidation } = require("../helpers/error");

exports.handler = async (event) => {

    try {

        let apigatewayUrl = 'https://' + event['headers']['Host'] + '/' + event['requestContext']['stage'] + '/' + process.env.APIGATEWAY_NAME_MEASURE + '/get/' + event.pathParameters.iDdevice;
        let query = validateInputMeasureGet(event);
        let data = {};
        if (query.token) {
            data = await getMeasureFromDynamoToken(query);
        } else {
            data = await getMeasureFromDynamoInterval(query);
        }
        let dataChanged = transformOutputMeasure(data, apigatewayUrl, query);
        return response(200, dataChanged);

    } catch (error) {
        /**
         * Almacena cualquier error en CloudWatch
         */
        console.log(error.message);
        console.log(error.stack);

        if (error instanceof ErrorValidation) {
            return response(404, { error: error.message });
        } else {
            return response(404, { error: "Puede que los parámetros ingresados no coincidan o fueron modificados." });
        }

    }

};