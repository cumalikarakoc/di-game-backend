import sql from "mssql";
import config from "../../config";

const {DB_USER, DB_PASSWORD, DB_HOST, DB_NAME} = config;

export default  new sql.ConnectionPool({
    database: DB_NAME,
    password: DB_PASSWORD,
    server: DB_HOST,
    user: DB_USER,
});
