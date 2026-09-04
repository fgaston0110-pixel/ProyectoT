// traigo las variables de entorno en .env
require('dotenv').config()
// Instancio mi constructor de la librería Sequelize en sequelize 
const {Sequelize} = require('sequelize'); 
// Destructuro las variables de entorno
const { DB_USER, DB_PASSWORD, DB_HOST } = process.env;

// Conecto a la base de datos
// Segun la documentacion de Sequelize
// https://sequelize.org/docs/v6/getting-started/#setting-up-a-connection
// puedo conectarme de la manera que sigue:
// const sequelize = new Sequelize ('personas', 'postgres','1234', 
//     {host: 'localhost',dialect: 'postgres',
//     });
// O usando las variables de entorno como sigue:
// sequelize es la instanciación de la libreria Sequelize, este va
// a servir para adecuarlo a mi proyecto particular
const sequelize = new Sequelize(
  `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/hospital`,
  {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
    host: "localhost",
    dialect: "postgres"
  }
);

// Exporto la conexión  
module.exports = sequelize;