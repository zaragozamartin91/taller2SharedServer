# Shared Server
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

## Inicio
Para iniciar el server, se debe:
* establecer la variable de entorno PORT en caso de querer modificar el puerto de ejecucion por defecto (defecto: 5000)
* establecer la variable de entorno DEBUG en caso de querer debuguear los componentes de React utilizados desde el browser (asignar cualquier valor)
* correr el comando **npm start**

## Reporte de cobertura
El reporte de cobertura de código se generará en /coverage luego de correr el comando **npm run coverage**

## Linter
Para correr el linter de la aplicacion, correr el comando **npm run lint**

## Tests
Para correr los tests de la aplicación, correr el comando **npm test**


PRUEBA
