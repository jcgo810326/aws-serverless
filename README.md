# api-serverless-aws

## Despliegue de endpoints

Actualice las dependencias 
```sh
npm install
```

Instalación de serverless 
```sh
npm install serverless -g
```

Configuración de usuario AWS 
```sh
serverless config credentials
```

Despliegue
```sh
serverless deploy
```

Fuentes de consulta
```sh
- AWS Credentials: https://www.serverless.com/framework/docs/providers/aws/guide/credentials/
- Star Wars API: https://swapi.dev/
```


## Funciones AWS Lambda
Revisar archivo docs/Manual de uso

- Agregar empleado
https://vu65b71shj.execute-api.us-east-1.amazonaws.com/dev/api/employee/add 

- Modificar empleado
https://vu65b71shj.execute-api.us-east-1.amazonaws.com/dev/api/employee/upd

- Recuperar empleado
https://vu65b71shj.execute-api.us-east-1.amazonaws.com/dev/api/employee/get/{employee_id}

- Recuperar recursos
https://vu65b71shj.execute-api.us-east-1.amazonaws.com/dev/api/starwars/{resource} 

- Recuperar recurso especifico
https://vu65b71shj.execute-api.us-east-1.amazonaws.com/dev/api/starwars/{resource}/{idOrSchema}
