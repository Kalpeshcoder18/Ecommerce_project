const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Kalpesh@01",
  database: "shopping_db",
});
module.exports = connection;