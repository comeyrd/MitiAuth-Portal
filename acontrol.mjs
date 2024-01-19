import mitiAccount from "miti-account";
import mitiAuth from "miti-auth";
import mitiSettings from "miti-settings";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { layout } from './module1.mjs';

dotenv.config();
const mysqlConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

let mysqlPool = await mysql.createPool(mysqlConfig);


class Acontrol {
  
  constructor() {
    this.pool = mysqlPool;
    this.mitiSett = new mitiSettings(layout);
    this.auth = new mitiAuth(mysqlPool, mitiSett);
    this.account = new mitiAccount(mysqlPool, auth, mitiSett);
  }

  async login(login,password){
    let token = await this.auth.login(login,password,layout.FUSER.id);
    return {token:token,expiration:this.auth.jwtExpiration};
  }

  async validate(token){
    const decoded = await auth.checkJWT(token);
    if (decoded.type === layout.FUSER.id && decoded.userId) {
      return { id: decoded.userId, type: layout.FUSER.id };
    } 
  }

  async register(login,password){
    const newtoken = await auth.register(login, password, layout.FUSER.id);
    return { token: newtoken, expiration: this.auth.jwtExpiration };
  }

async delete(token){
  await auth.delete(token);
}

async logout(token){
  const newtoken = await auth.logout(token);
  return { token: newtoken, expiration: this.auth.logoutExpiration };
}

async update(token,login,password){
  await this.auth.update(token,login,password);
}

}
export { Acontrol };
