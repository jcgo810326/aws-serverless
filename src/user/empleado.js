const { LexModelBuildingService } = require('aws-sdk');
const AWS = require('aws-sdk');
const express = require('express');
const uuid = require('uuid');

const IS_OFFLINE = true; // process.env.NODE_ENV !== 'production';
const EMPLOYEES_TABLE = "Empledo"; // process.env.TABLE;
const dynamoDb = IS_OFFLINE === true ?
    new AWS.DynamoDB.DocumentClient({
        region: 'us-east-1',
        endpoint: 'http://127.0.0.1:8080',
    }) :
    new AWS.DynamoDB.DocumentClient();

module.exports.adiciona = function (data) {

    const id = uuid.v4();
    const name = data.name;    
    const params = {
        TableName: EMPLOYEES_TABLE,
        Item: {
            id,
            name
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            // res.status(400).json({ error: 'Could not create Employee' });
            return JSON.stringify({ error: 'Could not create Employee' });
        }
        /*
        res.json({
            id,
            name
        });        
        */
        return JSON.stringify({
            "id": id,
            "name": name
        });
    });

}

module.exports.actualiza = function (data) {
    const id = data.id;
    const name = data.name;
    const params = {
        TableName: EMPLOYEES_TABLE,
        Key: {
            id
        },
        UpdateExpression: 'set #name = :name',
        ExpressionAttributeNames: { '#name': 'name' },
        ExpressionAttributeValues: { ':name': name },
        ReturnValues: "ALL_NEW"
    }

    dynamoDb.update(params, (error, result) => {
        if (error) {
            // res.status(400).json({ error: 'Could not update Employee' });
            return JSON.stringify({ error: 'Could not update Employee' });
        }
        // res.json(result.Attributes);
        return JSON.stringify(result.Attributes);
    });
}

module.exports.recupera = function (id) {
    // const id = data.id;
    const params = {
        TableName: EMPLOYEES_TABLE,
        Key: {
            id
        }
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
            // res.status(400).json({ error: 'Error retrieving Employee' });
            return false;
        }

        if (result.Item) {
            // res.json(result.Item);
            return JSON.stringify(result.Item);
        } else {
            // res.status(404).json({ error: `Employee with id: ${id} not found` });
            return JSON.stringify({ error: `Employee with id: ${id} not found` });
        }
    });   
}

module.exports.elimina = function (id) {
    // const id = data.id;
    const params = {
        TableName: EMPLOYEES_TABLE,
        Key: {
            id
        }
    };

    dynamoDb.delete(params, (error) => {
        if (error) {
            // res.status(400).json({ error: 'Could not delete Employee' });
            return JSON.stringify({ error: 'Could not delete Employee' });
        }
        // res.json({ success: true });
        return JSON.stringify({ success: true });
    });   
}

module.exports.lista = function () {
    const params = {
        TableName: EMPLOYEES_TABLE
    };

    dynamoDb.scan(params, (error, result) => {
        if (error) {
            // res.status(400).json({ error: 'Error fetching the employees' });
            return JSON.stringify({ error: 'Error fetching the employees' });
        }

        res.json(result.Items);
        return JSON.stringify(result.Items);
    });   
}