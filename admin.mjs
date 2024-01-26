import mitiAccount from "miti-account";
import mitiAuth from "miti-auth";
import mitiSettings from "miti-settings";
import mitiAdmin from "miti-admin";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { layout } from "./dblayout.mjs";

//TODO FAIRE ADMINED
/*
const admined = async (req, res, next) => {
  const { token } = req.body;
  try {
    const decoded = await this.auth.checkJWT(token);
    if (decoded.type === adminType && decoded.ADMINId) {
      req.authData = {
        type: decoded.type,
        id: decoded.ADMINId,
      };
      next();
    }
  } catch (error) {
    res.status(200).json({
      Response: "Error",
      data: { type: "Auth Error", message: error.message },
    });
  }
};
*/

dotenv.config();

const mysqlConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

class Admin {
  constructor() {
    this.mitiSett = new mitiSettings(layout);
    
  }
  async init(){
    this.mysqlPool = await mysql.createPool(mysqlConfig);
    this.auth = new mitiAuth(this.mysqlPool, this.mitiSett);
    this.account = new mitiAccount(this.mysqlPool, this.auth, this.mitiSett);
    this.admin = new mitiAdmin(this.mysqlPool,this.auth,this.account,this.mitiSett);
}


  async create(login, password, userObj) {
    const token = await this.auth.register(login, password, layout.ADMIN.id);
    await this.account.create(userObj, token);
  }

  async listUsers(){
    let users={};
    const types = this.mitiSett.getUserTypes();
    for (let type in types){
      users[types[type]] = await this.admin.list(types[type]);
    }
    return users;
  }

}
export default Admin;
