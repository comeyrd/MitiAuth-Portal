import mitiAccount from "miti-account";
import mitiAuth from "miti-auth";
import mitiSettings from "miti-settings";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { layout } from './dblayout.mjs';


//TODO FAIRE ADMINED
/*
const admined = async (req, res, next) => {
  const { token } = req.body;
  try {
    const decoded = await this.auth.checkJWT(token);
    if (decoded.type === adminType && decoded.userId) {
      req.authData = {
        type: decoded.type,
        id: decoded.userId,
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

let mysqlPool = await mysql.createPool(mysqlConfig);


class Acontrol {
  
  constructor() {
    this.pool = mysqlPool;
    this.mitiSett = new mitiSettings(layout);
    this.auth = new mitiAuth(mysqlPool, this.mitiSett);
    this.account = new mitiAccount(mysqlPool, this.auth, this.mitiSett);
  }

  async login(login,password){
    let token = await this.auth.login(login,password,layout.FUSER.id);
    return {token:token,expiration:this.auth.jwtExpiration};
  }

  async validate(token){
    const decoded = await this.auth.checkJWT(token);
    if (decoded.type === layout.FUSER.id && decoded.userId) {
      return { id: decoded.userId, type: layout.FUSER.id };
    } 
  }

  async register(login,password){
    const newtoken = await this.auth.register(login, password, layout.FUSER.id);
    return { token: newtoken, expiration: this.auth.jwtExpiration };
  }

async delete(token){
  await  this.account.delete(token);
  await this.auth.delete(token);
}

async logout(token){
  const newtoken = await this.auth.logout(token);
  return { token: newtoken, expiration: this.auth.logoutExpiration };
}

async update(token,login,password){
  await this.auth.update(token,login,password);
}

async getinfo(token){
  return await this.account.read(token);
}

async editinfo(token,infoObj){
  return await  this.account.update(infoObj, token);
}

async getScheme(token){
  return await this.account.getScheme(token);
}

}
export default Acontrol;
