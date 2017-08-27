# Shared Server

Dado que se requiere poseer varios Application servers, AppMaker© nos solicita que se desarrolle un servidor encargado de la administración de los mismos y que pueda mantener información común a todos.

El _Shared Server_ deberá tener una interfaz de usuario WEB orientado para un usuario de negocios quien principalmente lo utilizará para poder ver estado de cada Application Server. Los usuarios finales nunca utilizaran esta plataforma, ya que solo utilizaran el cliente Android el cual se comunica con su _Application Server_.

El mismo deberá ser implementado utilizando NodeJS para el desarrollo de la API y Angular 2 o ReactJS para el desarrollo de la aplicación web. Además se deberá utilizar Postgresql como base de datos.

Para que los Application Servers puedan comunicarse se deberá implementar una [API común](llevame.yaml) (Restful API [1]). Los Application Servers se limitarán a utilizar dicha API para interactuar con el Shared Server. La interfaz web de este último podrá utilizar endpoints no definidos en la misma. De esta manera se asegurará la interoperabilidad con las diferentes implementaciones de Application Server.

#### Servicio de gestión de usuarios de negocio

Este servicio permitirá la creación de usuarios y asignación de distintos roles. Deberá existir el rol de administrador que permitirá a un usuario realizar estas tareas. Además, deberán existir distintos roles que permitan o prohí­ban la utilización de los diferentes servicios.

#### Servicio de gestión de datos de usuarios

Este servicio permitirá visualizar datos de los usuarios de los _Application Servers_, es decir, de los pasajeros y conductores. Además, se desea que la posibilidad de tener filtros para realizar busquedas.

#### Servicio de gestión de _Aplication Server_

Este servicio permitirá dar de alta un _Aplication Server_, genererá un _token_ único que dicho server utilizará para autenticarse frente a la plataforma.

Se tiene que poder listar los _Application Servers_ que se encuentren autorizados, con la posibilidad de revocarlos.

#### Servicio de estado actual

Servicio que podrá visualizar el estado actual de todos los _application servers_ corriendo. Se valora el uso de gráficos.

#### Servicio de reportes

Servicio que mostrará estádisticas y reportes acerca de los _application servers_. Se valora el uso de gráficos.

#### Servicio de cotización de viaje

Debido a la necesidad de poder tener flexibilidad a la hora de establecer los precios para mantenerse competitivo. AppMakerÂ© exige que el cálculo del precio sea realizado utilizando un sistema de reglas.

El servidor deberá permitir la modificación y guardado de las mismas manteniendo un registro de cambios. Además, deberá permitir al usuario hacer pruebas con las reglas escritas previo a quedar efectivas en la cotización de los viajes.

Para el sistema de reglas, se sugiere la utilización de alguno de los siguientes motores:

* [Nools](https://github.com/noolsjs/nools)
* [Node Rules](https://github.com/mithunsatheesh/node-rules)
* [Json Rules Engine](https://github.com/cachecontrol/json-rules-engine)

Las reglas deben permitir el cálculo del precio del viaje utilizando, entre otras cosas, la siguientes variables:

* Caracterí­sticas del conductor (viajes en el dí­a, viajes en el mes, antigí¼edad)
* Caracterí­sticas del pasajero (viajes en el dí­a, viajes en el mes, antigí¼edad, saldo)
* Mí©todo de pago
* Caracterí­sticas del viaje (duración, distancia, posición geográfica, fecha y hora)
* Cantidad de viajes que se realizaron en la última ventana temporal (Hora, 30 mins, 10 mins)
* Application server que realiza la cotización
* Dí­a y horario de la realización del viaje
* Tiempo de espera del pasajero para:
  * Que un conductor le confirme el viaje
  * Que el conductor llegue a buscarlo

Además, mediante estas reglas, se deberá determinar si el usuario esta habilitado para realizar el viaje.

Se deberán desarrollar a modo de ejemplo las siguientes reglas:

* Pasajero:
  * Costo de viaje mí­nimo de 50ARS
  * Precio por KM de 15ARS
  * Descuento del 5% los mií©rcoles de 15hs a 16hs
  * Descuento de 100ARS en primer viaje
  * Recargo del 10% Lunes a Viernes de 17hs a 19hs
  * Recargo del 15% si en los últimos 30 mins se realizaron más de 10 viajes
  * Viaje gratis si usuario tiene un mail con dominio `@llevame.com`
  * No se le permitirá viajar si tiene saldo negativo
  * Descuento del 5% a partir del 5 viaje del dí­a
* Conductor:
  * Pago de viaje mí­nimo 30ARS
  * Pago por KM de 5ARS
  * Aumento del 3% de Lunes a Viernes de 17hs a 19hs
  * Aumento del 2% si realizó más de 10 viajes en el dí­a

#### Servicio viajes

Se disponibilizará un servicio para que se informen los viajes realizados. El _Shared server_ deberá ser el encargado de realizar los cobros y mantener el balance de los usuarios. Para esto, utilizará [_Taller II Payment API_Â©](https://github.com/gfusca/taller-ii-payment-api). Se deberá tener en cuenta, que el pago podrí­a llegar a fallar.

Además, este servicio debe permitir almacenar y consultar los datos relacionados con los viajes realizados.

**Nota:** El uso de servicios externos es una tarea que podrí­a ser larga en cuestiones temporales. Debido a esto, esas tareas se deben realizar en el _fondo_.

## Herramientas
---------------------
### Nodejs 
* [Windows 64 bits](https://nodejs.org/dist/v6.11.2/node-v6.11.2-x64.msi).
* [Windows 32 bits](https://nodejs.org/dist/v6.11.2/node-v6.11.2-x86.msi).
* [MACOS](https://nodejs.org/dist/v6.11.2/node-v6.11.2.pkg)
* [OTROS](https://nodejs.org/en/download/)
* Agregar node a la variable de entorno PATH
### IDE
* [Visual studio code](https://code.visualstudio.com/)
### MATERIAL-UI
* [Componentes](https://www.material-ui.com/#/components/app-bar)

Como correr
---------------------
* Correr "npm install" en la terminal para descargar las dependencias del proyecto
* Correr "npm run build" para compilar los componentes de REACT
* Correr "npm test" para testear los scripts del directorio test/
* Correr "npm start" para iniciar la app
* Acceder a la app en http://localhost:8080/main
