const express = require('express');
// const objEmpleado = require('empleado.js');

const { LexModelBuildingService } = require('aws-sdk');
const AWS = require('aws-sdk');
const uuid = require('uuid');

const IS_OFFLINE = false; // process.env.NODE_ENV !== 'production';
const EMPLOYEES_TABLE = "Employee"; // process.env.TABLE;
// const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const dynamoDb = IS_OFFLINE === true ?
    new AWS.DynamoDB.DocumentClient({
        region: 'us-east-1',
        endpoint: 'http://127.0.0.1:8080',
    }) :
    new AWS.DynamoDB.DocumentClient();

const routes = express.Router({
    mergeParams: true
});

routes.get('/', (req, res) => {
    res.status(200).json({});
});

// Agregar registro
routes.post('/add', (req, res) => {
    /*
    const resultado = objEmpleado.adiciona(JSON.stringify(req.body));
    if (!resultado.error) {
        res.status(200).json({
            // nombre: req.body.nombre
            status: 200,
            mensaje: "Registro insertado.",
            respuesta: resultado 
        });
    } else {
        res.status(400).json(resultado.error);
    }
    */
    const id = uuid.v4();
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const birthday = req.body.birthday;
    const job_name = req.body.job_name;
    const salary = req.body.salary;

    const params = {
        TableName: EMPLOYEES_TABLE,
        Item: {
            'ID': id,
            'first_name': first_name,
            'last_name': last_name,
            'birthday': birthday,
            'job_name': job_name,
            'salary': salary
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            res.status(500).json({ error: 'Could not create Employee => ' + error });
        } else {
            res.status(200).json(params.Item);        
        }
    });

});

// Actualizar registro
routes.put('/put/', (req, res) => {
    /*
    const resultado = objEmpleado.actualiza(JSON.stringify(req.body));
    if (!resultado.error) {
        res.status(200).json({
            // nombre: req.body.nombre
            status: 200,
            mensaje: "Registro actualizado.",
            respuesta: resultado 
        });
    } else {
        res.status(400).json(resultado.error);
    }
    */

    const id = req.body.id;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const birthday = req.body.birthday;
    const job_name = req.body.job_name;
    const salary = req.body.salary;

    const params = {
        TableName: EMPLOYEES_TABLE,
        Key: {
            'ID': id
        },

        UpdateExpression: 'set #first_name = :first_name, #last_name = :last_name, #birthday = :birthday, #job_name = :job_name, #salary = :salary',
        ExpressionAttributeNames: { '#first_name': 'first_name', '#last_name': 'last_name', '#birthday': 'birthday', '#job_name': 'job_name', '#salary': 'salary' },
        ExpressionAttributeValues: { ':first_name': first_name, ':last_name': last_name, ':birthday': birthday, ':job_name': job_name, ':salary': salary },

        ReturnValues: "ALL_NEW"
    }

    dynamoDb.update(params, (error, result) => {
        if (error) {
            res.status(500).json({ error: 'Could not update Employee => ' + error});
        } else {
            res.status(200).json(result.Attributes);
        }
    });    
});

// Recuperar registro
routes.get('/get/:id', (req, res) => {
    /*
    const resultado = objEmpleado.recupera(req.params.id);
    if (!resultado.error) {
        res.status(200).json({
            status: 200,
            mensaje: "Registro recuperado.",
            respuesta: resultado 
        });
    } else {
        res.status(400).json(resultado.error);
    }
    */

    const id = req.params.id;
    const params = {
        TableName: EMPLOYEES_TABLE,
        Key: {
            'ID': id
        }
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
            res.status(500).json({ error: 'Error retrieving Employee' });
        }

        if (result.Item) {
            res.json(result.Item);
        } else {
            res.status(500).json({ error: `Employee with id: ${id} not found` });
        }
    });       

});

// Eliminar registro
routes.delete('/del/:id', (req, res) => {
    /*
    const resultado = objEmpleado.elimina(req.params.id);
    if (!resultado.error) {
        res.status(200).json({
            status: 200,
            mensaje: "Registro eliminado.",
            respuesta: resultado 
        });
    } else {
        res.status(400).json(resultado.error);
    }
    */

    const id = req.params.id;
    const params = {
        TableName: EMPLOYEES_TABLE,
        Key: {
            'ID': id
        }
    };

    dynamoDb.delete(params, (error) => {
        if (error) {
            res.status(500).json({ error: 'Could not delete Employee' });
        } else {
            res.json({ success: true });
        }
    });     
});

// Recuperar lista
routes.get('/list', (req, res) => {
    /*
    const resultado = objEmpleado.lista();
    if (!resultado.error) {
        res.status(200).json({
            status: 200,
            mensaje: "Registros recuperados.",
            respuesta: resultado 
        });
    } else {
        res.status(400).json(resultado.error);
    }
    */

    const params = {
        TableName: EMPLOYEES_TABLE
    };

    dynamoDb.scan(params, (error, result) => {
        if (error) {
            res.status(500).json({ error: 'Error fetching the employees' });
        } else {
            res.json(result.Items);
        }
    });       

});

module.exports = {
    routes,
};