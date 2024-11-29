const response = require("../helpers/response");
const { validateInputEmployeeGet, transformOutputEmployee } = require("../helpers/validate");
const { getEmployeeFromDynamoInterval, getEmployeeFromDynamoToken } = require("../helpers/dynamo");
const { ErrorValidation } = require("../helpers/error");

exports.handler = async (event) => {

    try {

        let apigatewayUrl = 'https://' + event['headers']['Host'] + '/' + event['requestContext']['stage'] + '/' + process.env.APIGATEWAY_NAME_EMPLOYEE + '/get/' + event.pathParameters.employee_id;
        // let query = validateInputMeasureGet(event);
        let query = validateInputEmployeeGet(event);
        let data = {};
        data = await getEmployeeFromDynamoInterval(query);
        /*
        if (query.token) {
            data = await getEmployeeFromDynamoInterval(query);
        } else {
            data = await getEmployeeFromDynamoToken(query);
        }
        */
        let dataChanged = transformOutputEmployee(data, apigatewayUrl, query);
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