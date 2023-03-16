import pg from "pg";
import dbConfig from "../config/db.config.js";

const { Client } = pg;
const db = new Client({
    user: dbConfig.USER,
    host: dbConfig.HOST,
    database: dbConfig.DB,
    password: dbConfig.PASSWORD,
    port: 5432,
});

export default db;
