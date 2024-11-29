const aws = require('aws-sdk');
const { ErrorValidation } = require("./error");

const dynamo = new aws.DynamoDB({
    apiVersion: '2012-08-10',
    region: "us-east-1"
});

/**
 * 
 * @param {*} obj 
 */
 async function addEmployee(obj) {
    const params = {
        Item: aws.DynamoDB.Converter.marshall(obj),
        TableName: `${process.env.EMPLOYEE_TABLE}`
    };
    
    return dynamo.putItem(params).promise();
    
};

/**
 * 
 * @param {*} query 
 */
 async function getEmployeeFromDynamoInterval(query) {
    var params = {
        ExpressionAttributeValues: {
            ":v1": {
                S: query.employee_id
            }
        },
        Limit: parseInt(`${process.env.DYNAMODB_LIMIT_QUERY}`),
        ScanIndexForward: true,
        ExpressionAttributeNames: {
            "#employee_id": "employee_id"
        },
        TableName: `${process.env.EMPLOYEE_TABLE}`,
        KeyConditionExpression: "#employee_id =:v1",
    };
    return dynamo.query(params).promise();
}

/**
 * 
 * @param {*} query 
 */
async function getEmployeeFromDynamoToken(query) {

    var params = {
        ExpressionAttributeValues: {
            ":v1": {
                S: query.employee_id
            }
        },
        ExclusiveStartKey: { "employee_id": query.token.employee_id },
        Limit: parseInt(`${process.env.DYNAMODB_LIMIT_QUERY}`),
        ScanIndexForward: true,
        ExpressionAttributeNames: {
            "#employee_id": "employee_id",
        },
        TableName: `${process.env.EMPLOYEE_TABLE}`,
        KeyConditionExpression: "#employee_id =:v1",
    };
    return dynamo.query(params).promise();
}

/**
 * 
 * @param {*} obj 
 */
 async function updEmployee(query) {

    var params = {
        TableName: `${process.env.EMPLOYEE_TABLE}`,
        Key: {
            "employee_id": {
                S: query.employee_id
            }
        }, 
        UpdateExpression: "set #first_name = :v2, #last_name = :v3, #gender = :v4, #birthdate = :v5, #salary = :v6, #department = :v7, #boss = :v8, #startdate = :v9",
        ConditionExpression: "employee_id = :v1",   
        ExpressionAttributeNames: {
            "#first_name": "first_name",
            "#last_name": "last_name",
            "#gender": "gender",
            "#birthdate": "birthdate",
            "#salary": "salary",
            "#department": "department",
            "#boss": "boss",
            "#startdate": "startdate"
        },   
        ExpressionAttributeValues: { 
            ":v1": {
                S: query.employee_id
            },
            ":v2": {
                S: query.first_name
            },
            ":v3": {
                S: query.last_name
            },
            ":v4": {
                S: query.gender
            },
            ":v5": {
                S: query.birthdate
            },
            ":v6": {
                S: query.salary.toString()
            },
            ":v7": {
                S: query.department
            },
            ":v8": {
                S: query.boss
            }, 
            ":v9": {
                S: query.startdate
            }
        },        
        ReturnValues: "UPDATED_NEW"
    };

    var resultado = {};
    dynamo.updateItem(params, (error, result) => {
        if (error) {
            resultado = { "error": "Could not update Employee => " + error };
        } else {
            // resultado = { "result": result.Attributes };
            resultado = { "resultado": "Actualización realizada." };
        }
    });

    return resultado;

};

/**
 * 
 * @param {*} obj 
 */
async function addMeasureToDynamdo(obj) {
    var params = {
        Item: aws.DynamoDB.Converter.marshall(obj),
        TableName: `${process.env.DYNAMODB_NAME_MEASUREMENT}`
    };
    return dynamo.putItem(params).promise();
};

/**
 * 
 * @param {*} query 
 */
async function getMeasureFromDynamoInterval(query) {
    var params = {
        ExpressionAttributeValues: {
            ":v1": {
                S: query.idDevice
            },
            ":v2": {
                N: query.from
            },
            ":v3": {
                N: query.to
            }
        },
        Limit: parseInt(`${process.env.DYNAMODB_LIMIT_QUERY}`),
        ScanIndexForward: true,
        ExpressionAttributeNames: {
            "#sample_time": "sample_time",
            "#device_id": "device_id",
        },
        TableName: `${process.env.DYNAMODB_NAME_MEASUREMENT}`,
        KeyConditionExpression: "#device_id =:v1  AND  #sample_time BETWEEN :v2 AND :v3",
    };
    return dynamo.query(params).promise();
}

/**
 * 
 * @param {*} query 
 */
async function getMeasureFromDynamoToken(query) {

    var params = {
        ExpressionAttributeValues: {
            ":v1": {
                S: query.idDevice
            },
            ":v2": {
                N: query.from
            },
            ":v3": {
                N: query.to
            }
        },
        ExclusiveStartKey: { "device_id": query.token.device_id, "sample_time": query.token.sample_time },
        Limit: parseInt(`${process.env.DYNAMODB_LIMIT_QUERY}`),
        ScanIndexForward: true,
        ExpressionAttributeNames: {
            "#sample_time": "sample_time",
            "#device_id": "device_id",
        },
        TableName: `${process.env.DYNAMODB_NAME_MEASUREMENT}`,
        KeyConditionExpression: "#device_id =:v1  AND  #sample_time BETWEEN :v2 AND :v3",
    };
    return dynamo.query(params).promise();
}

/**
 * 
 * @param {*} object 
 */
function parseDynamoJson(object) {
    try {
        return aws.DynamoDB.Converter.unmarshall(object);
    } catch (error) {
        throw new ErrorValidation(`Ocurrió un error al parser un DynamoJson.`);
    }
}

module.exports = {
    addEmployee, getEmployeeFromDynamoInterval, getEmployeeFromDynamoToken, updEmployee, addMeasureToDynamdo, getMeasureFromDynamoInterval, parseDynamoJson, getMeasureFromDynamoToken
}