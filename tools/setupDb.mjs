import mysql from "mysql2/promise";
import User from "../AccessControl/Classes/user.mjs";

import dotenv from "dotenv";
import Admin from "../AccessControl/Classes/admin.mjs";
import { layout } from "../dblayout.mjs";
dotenv.config();

const mysqlConfig = {
  host: process.env.DB_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

const mysqlConfigFirst = {
  host: process.env.DB_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: "",
};

(async () => {
  let con;

  try {
    //con = await mysql.createConnection(mysqlConfigFirst);
    //await con.query(`DROP DATABASE mapi;`);
    //await con.query(`CREATE DATABASE mapi;`);
    //await con.end();
    let user = new User(layout,mysqlConfig);
    let admin = new Admin(layout,mysqlConfig,layout.ADMIN.id);
    await user.init();
    await admin.init();
    await user.setupDb();
    await user.create( "user","user",{ email: "user@ceyraud.com", name: "User" },"user");
    await admin.create( "admin","admin",{ email: "admin@ceyraud.com", name: "Admin" ,phone:"AdminAdminAdmin"});
    await admin.create( process.env.ROOT_LOG,process.env.ROOT_PASS,{ email: "miti@ceyraud.com", name: "Miti" ,phone:"823712"});
    console.log("Done");
  } catch (e) {
    console.error("An error occurred:", e);
  } finally {
    // Close your connections or do any other necessary cleanup here
    if (con) {
      await con.end();
    }
    // Exit the Node.js process
    process.exit(0);
  }
})();
