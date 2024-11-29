const swapi = require("../swapi.json");
const translateSwapiSchema = require("../schema/translateSwapi.json");
const measureSchema = require("../schema/measure.json");
const employeeSchema = require("../schema/employee.json");
const { ErrorValidation } = require("./error");
const { parseDynamoJson } = require("./dynamo")
const querystring = require('querystring');
const Validator = require('jsonschema').Validator;
const validatorSchema = new Validator();
validatorSchema.addSchema(measureSchema, '/MeasureIoT');
validatorSchema.addSchema(employeeSchema, '/Employee');

/**
 * 
 * @param {*} data 
 * @param {*} type 
 */
function verifyVarType(data, type) {
    return data !== null && typeof data === type;
}

/**
 * 
 * @param {*} value 
 */
function varIsNull(value) {
    return value === null || value === undefined;
}

/**
 * 
 * @param {*} value 
 */
function varIsNumeric(value) {
    return /^-?\d+$/.test(value);
}

/**
 * 
 * @param {*} value 
 */
function varIsInteger(value) {
    if (value.match(/^-?\d+$/)) {
        return true;
    }
    return false;
}

/**
 * 
 * @param {*} swapi 
 * @param {*} pathParamsEvent 
 * @param {*} errorMessage 
 */
function isInResourceSwapi(swapi, pathParamsEvent, errorMessage) {
    if (swapi.resourcesAllowed.indexOf(pathParamsEvent.resource) === -1) {
        throw new ErrorValidation(errorMessage);
    }
}

/**
 * 
 * @param {*} resourceEvent 
 * @param {*} queryParamsEvent 
 * @param {*} pathParamsEvent 
 */
function getQueryParamsResourceIdOrSchema(resourceEvent, queryParamsEvent, pathParamsEvent) {

    if (!varIsNull(queryParamsEvent)) {
        throw new ErrorValidation(`no se acepta paramatro Query, en ${resourceEvent}`);
    }

    if (!varIsNumeric(pathParamsEvent.idOrSchema) && pathParamsEvent.idOrSchema !== "schema") {
        throw new ErrorValidation(`el recurso solicitado no es valido, en ${resourceEvent}`);
    }

    return "/" + pathParamsEvent.idOrSchema;
}

/**
 * 
 * @param {*} resourceEvent 
 * @param {*} queryParamsEvent 
 */
function getQueryParamsResource(resourceEvent, queryParamsEvent) {

    if (varIsNull(queryParamsEvent)) {
        return '/';
    } else {

        if (!verifyVarType(queryParamsEvent.page, "string")) {
            throw new ErrorValidation(`el recurso page no se encuentra como paramatro Query, en ${resourceEvent}`);
        }

        let pageNumber = queryParamsEvent.page;

        if (!varIsNumeric(pageNumber)) {
            throw new ErrorValidation(`el recurso page debe ser valor numerico como paramatro Query, en ${resourceEvent}`);
        } else {
            return '/?page=' + pageNumber;
        }
    }
}

/**
 * 
 * @param {*} apiData 
 * @param {*} apigatewayUrl 
 */
function transformOutput(apiData, apigatewayUrl) {

    let textData = JSON.stringify(apiData);
    let textTranslated = JSON.stringify(JSON.parse(textData, function (k, v) {
        if (translateSwapiSchema[k]) {
            this[translateSwapiSchema[k]] = v
            return;
        }
        return v;
    }));

    let textDataChangeURL = textTranslated.split(swapi.url).join(apigatewayUrl);
    return JSON.parse(textDataChangeURL);
}

/**
 * 
 * @param {*} event 
 */
function generateUrl(event) {

    let resourceEvent = event.resource;

    let pathParamsEvent = event.pathParameters;
    let queryParamsEvent = event.queryStringParameters;

    var params = {};

    switch (resourceEvent) {
        case `/${process.env.APIGATEWAY_NAME_SWAPI}/{resource}`:

            isInResourceSwapi(swapi, pathParamsEvent, "el recurso buscado no pertenece a la lista");
            params.query = getQueryParamsResource(resourceEvent, queryParamsEvent);

            break;
        case `/${process.env.APIGATEWAY_NAME_SWAPI}/{resource}/{idOrSchema}`:

            isInResourceSwapi(swapi, pathParamsEvent, "el recurso buscado no pertenece a la lista");
            params.query = getQueryParamsResourceIdOrSchema(resourceEvent, queryParamsEvent, pathParamsEvent);

            break;
        default:
            break;
    }
    return swapi.url + pathParamsEvent.resource + params.query;

}

/**
 * 
 * @param {*} event 
 */
function getJsonDataFromUrl(event) {

    let contentType = event['headers']['Content-Type'] || event['headers']['content-type'];
    let body = event['body'];

    let postData = {};

    switch (contentType) {
        case "application/x-www-form-urlencoded":
            try {
                postData = querystring.parse(body);
                postData.sample_time = Number(postData.sample_time);
                postData.measure_value = Number(postData.measure_value);
                postData.latitud = Number(postData.latitud);
                postData.longitud = Number(postData.longitud);
            } catch (error) {
                throw new ErrorValidation(`Error al parsear x-www-form-urlencoded post data.`);
            }
            break;

        case "application/json":
            try {
                postData = JSON.parse(body);
            } catch (error) {
                throw new ErrorValidation(`Error al parsear JSON post data.`);
            }
            break;

        default:
            throw new ErrorValidation(`El formato post consultado no es soportado.`);
            break;
    }
    return postData;
}

/**
 * 
 * @param {*} postData 
 */
 function validateInputEmployeePost(postData) {

    let validationData = validatorSchema.validate(postData, employeeSchema);

    let errorStack = "";
    if (validationData.errors.length > 0) {
        let errors = validationData.errors;
        for (let itemError in errors) {
            errorStack += ", " + errors[itemError].stack;
        }
        throw new ErrorValidation("El dato post no cumple con los requisitos" + errorStack);
    }

}

/**
 * 
 * @param {*} event 
 */
 function validateInputEmployeeGet(event) {

    let pathParamsEvent = event.pathParameters;
    let queryParamsEvent = event.queryStringParameters;


    let queryParams = {};

    queryParams.employee_id = pathParamsEvent.employee_id;

    if (varIsNull(queryParamsEvent)) {

        queryParams.from = "0";
        queryParams.to = Date.now() + "";

    } else {

        if (verifyVarType(queryParamsEvent.token, "string")) {
            queryParams.token = queryParamsEvent.token;
            try {
                queryParams.token = JSON.parse(Buffer.from(queryParams.token, 'base64').toString());
            } catch (error) {
                throw new ErrorValidation(`El parámetro Query Token es inválido.`);
            }
        }

        /*
        if (!verifyVarType(queryParamsEvent.from, "string")) {
            throw new ErrorValidation(`El parámetro Query From no ha sido encontrado.`);
        }

        if (!verifyVarType(queryParamsEvent.to, "string")) {
            throw new ErrorValidation(`El parámetro Query To no ha sido encontrado.`);
        }

        if (!varIsInteger(queryParamsEvent.from)) {
            throw new ErrorValidation(`El parámetro Query From debe ser número entero.`);
        }
        if (!varIsInteger(queryParamsEvent.to)) {
            throw new ErrorValidation(`El parámetro Query To debe ser número entero.`);
        }
        if (parseInt(queryParamsEvent.to) < parseInt(queryParamsEvent.from)) {
            throw new ErrorValidation(`El parámetro Query To debe ser número mayor que From.`);
        }
        if (parseInt(queryParamsEvent.to) < 0) {
            throw new ErrorValidation(`El parámetro Query To debe ser número mayor que 0.`);
        }
        if (parseInt(queryParamsEvent.from) < 0) {
            throw new ErrorValidation(`El parámetro Query From debe ser número mayor que 0.`);
        }
        queryParams.from = queryParamsEvent.from;
        queryParams.to = queryParamsEvent.to;
        */

    }
    return queryParams;
}

/**
 * 
 * @param {*} postData 
 */
function validateInputMeasurePost(postData) {

    let validationData = validatorSchema.validate(postData, measureSchema);

    let errorStack = "";
    if (validationData.errors.length > 0) {
        let errors = validationData.errors;
        for (let itemError in errors) {
            errorStack += ", " + errors[itemError].stack;
        }
        throw new ErrorValidation("El dato post no cumple con los requisitos" + errorStack);
    }

}

/**
 * 
 * @param {*} event 
 */
function validateInputMeasureGet(event) {

    let pathParamsEvent = event.pathParameters;
    let queryParamsEvent = event.queryStringParameters;


    let queryParams = {};

    queryParams.idDevice = pathParamsEvent.iDdevice;

    if (varIsNull(queryParamsEvent)) {

        queryParams.from = "0";
        queryParams.to = Date.now() + "";

    } else {
        if (verifyVarType(queryParamsEvent.token, "string")) {
            queryParams.token = queryParamsEvent.token;
            try {
                queryParams.token = JSON.parse(Buffer.from(queryParams.token, 'base64').toString());
            } catch (error) {
                throw new ErrorValidation(`El parámetro Query Token es inválido.`);
            }
        }
        if (!verifyVarType(queryParamsEvent.from, "string")) {
            throw new ErrorValidation(`El parámetro Query From no ha sido encontrado.`);
        }

        if (!verifyVarType(queryParamsEvent.to, "string")) {
            throw new ErrorValidation(`El parámetro Query To no ha sido encontrado.`);
        }

        if (!varIsInteger(queryParamsEvent.from)) {
            throw new ErrorValidation(`El parámetro Query From debe ser número entero.`);
        }
        if (!varIsInteger(queryParamsEvent.to)) {
            throw new ErrorValidation(`El parámetro Query To debe ser número entero.`);
        }
        if (parseInt(queryParamsEvent.to) < parseInt(queryParamsEvent.from)) {
            throw new ErrorValidation(`El parámetro Query To debe ser número mayor que From.`);
        }
        if (parseInt(queryParamsEvent.to) < 0) {
            throw new ErrorValidation(`El parámetro Query To debe ser número mayor que 0.`);
        }
        if (parseInt(queryParamsEvent.from) < 0) {
            throw new ErrorValidation(`El parámetro Query From debe ser número mayor que 0.`);
        }
        queryParams.from = queryParamsEvent.from;
        queryParams.to = queryParamsEvent.to;
    }
    return queryParams;
}


/**
 * 
 * @param {*} data 
 * @param {*} apigatewayUrl 
 * @param {*} query 
 */
 function transformOutputEmployee(data, apigatewayUrl, query) {

    let response = {};
    let items = {};
    data.Items.forEach((item, index) => {
        items[index] = { "M": item };
    });
    let parseToArray = parseDynamoJson(items);
    items = [];
    Object.keys(parseToArray).forEach(e => {
        items.push(parseToArray[e]);
    });

    response.items = items;
    response.count = data.Count;
    if (data.LastEvaluatedKey) {
        response.next = apigatewayUrl + '?token=' + Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString('base64')
            + "&from=" + query.from + "&to=" + query.to;
    }
    return response;
}

/**
 * 
 * @param {*} data 
 * @param {*} apigatewayUrl 
 * @param {*} query 
 */
function transformOutputMeasure(data, apigatewayUrl, query) {

    let response = {};
    let items = {};
    data.Items.forEach((item, index) => {
        items[index] = { "M": item };
    });
    let parseToArray = parseDynamoJson(items);
    items = [];
    Object.keys(parseToArray).forEach(e => {
        items.push(parseToArray[e]);
    });

    response.items = items;
    response.count = data.Count;
    if (data.LastEvaluatedKey) {
        response.next = apigatewayUrl + '?token=' + Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString('base64')
            + "&from=" + query.from + "&to=" + query.to;
    }
    return response;
}

module.exports = {
    generateUrl, transformOutput, getJsonDataFromUrl, validateInputEmployeePost, validateInputEmployeeGet, validateInputMeasurePost, validateInputMeasureGet, transformOutputMeasure, transformOutputEmployee
}