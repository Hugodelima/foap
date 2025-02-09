const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAMEDATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false, 
        dialectOptions: {
            useUTC: false,
        },
        timezone: 'America/Cuiaba', //no postgres o banco de dados que você criou coloque set timezone = 'America/Cuiaba';

        
    }
);

module.exports = sequelize;
