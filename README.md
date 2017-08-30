# Shared Server

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

## Tests
Para correr los tests de la aplicación, correr el comando **npm test**
