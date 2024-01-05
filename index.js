require("dotenv").config();
const Connect = require(`./app`);
const DatabaseConnection = require(`./db`);

try {
  DatabaseConnection().then(() => {
    console.log("connected to database");
    Connect();
  });
} catch (error) {
  console.log(error);
}
