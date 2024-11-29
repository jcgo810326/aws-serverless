const response = require("../helpers/response");
const { addMeasureToDynamdo } = require("../helpers/dynamo");
const { getJsonDataFromUrl, validateInputMeasurePost } = require("../helpers/validate");
const { ErrorValidation } = require("../helpers/error");

exports.handler = async (event) => {

    try {

        let postData = getJsonDataFromUrl(event);
        validateInputMeasurePost(postData);
        await addMeasureToDynamdo(postData);
        return response(200, { status: "Agregado o actualizado a DynamodDB." });

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