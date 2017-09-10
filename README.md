# Shared Server
[![Build Status](https://travis-ci.org/zaragozamartin91/taller2SharedServer.svg?branch=confTravis)](https://travis-ci.org/zaragozamartin91/taller2SharedServer)
<a href='https://coveralls.io/github/zaragozamartin91/taller2SharedServer?branch=confTravis'><img src='https://coveralls.io/repos/github/zaragozamartin91/taller2SharedServer/badge.svg?branch=confTravis' alt='Coverage Status' /></a>

## Prerequisitos
Para poder correr la aplicación, es necesario contar con:
* Nodejs v >= 6.2
* Npm v >= 3.2
* PostgreSql v >= 9

## Instalación
Previo a iniciar el server, es necesario correr los siguientes comandos:
* npm install
* npm run build

## Variables de entorno
Las variables de entorno soportadas son:
* PORT: puerto en el cual correra la app (por defecto es 5000)
* DATABASE_URL: url de la BBDD de postgres
* PGHOST: host de postgres (en caso de no usar DATABASE_URL)
* PGUSER: usuario de postgres (en caso de no usar DATABASE_URL)
* PGPASSWORD: password del usuario de postgres (en caso de no usar DATABASE_URL)
* PGDATABASE: base de datos de postgres a la cual conectarse (en caso de no usar DATABASE_URL)
* PGPORT: puerto del servidor de postgres (en caso de no usar DATABASE_URL)
* DEBUG: asignarle cualquier valor para poder debuguear los componentes de react desde un browser

## Inicio
Para iniciar el server, se debe:
* correr el comando **npm start**
* visitar la app en http://localhost:PORT/

## Reporte de cobertura
El reporte de cobertura de código se generará en /coverage luego de correr el comando **npm run coverage**

## Linter
Para correr el linter de la aplicacion, correr el comando **npm run lint**

## Tests
Para correr los tests de la aplicación, correr el comando **npm test**
