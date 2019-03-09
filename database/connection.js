const config = require('../config')
const {DB_USER, DB_PASSWORD, DB_HOST, DB_NAME} = config

module.exports = `mssql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;
