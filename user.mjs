import mitiAccount from "miti-account";
import mitiAuth from "miti-auth";
import mitiSettings from "miti-settings";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { layout } from "./dblayout.mjs";

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


class User {
  constructor() {
    this.mitiSett = new mitiSettings(layout);
  }
  async init() {
    this.mysqlPool = await mysql.createPool(mysqlConfig);
    this.auth = new mitiAuth(this.mysqlPool, this.mitiSett);
    this.account = new mitiAccount(this.mysqlPool, this.auth, this.mitiSett);
  }

  async login(login, password) {
    const users = this.mitiSett.getUserTypes();
    let err;
    for (const user in users) {
      try {
        let token = await this.auth.login(login, password, users[user]);
        return {
          token: token,
          expiration: this.auth.jwtExpiration,
          type: users[user],
        };
      } catch (error) {
        err = error;
      }
    }
    throw err;
  }

  async validate(token) {
    const decoded = await this.auth.checkJWT(token);
    return { id: decoded.userId, type: decoded.type };
  }

  async create(login, password, userObj) {
    const token = await this.auth.register(login, password, layout.USER.id);
    await this.account.create(userObj, token);
  }

  async delete(token) {
    await this.account.delete(token);
    await this.auth.delete(token);
  }

  async logout(token) {
    const newtoken = await this.auth.logout(token);
    return { token: newtoken, expiration: this.auth.logoutExpiration };
  }

  async changePass(token, login, password) {
    await this.auth.update(token, login, password);
  }

  async getinfo(token) {
    return await this.account.read(token);
  }

  async editinfo(token, infoObj) {
    return await this.account.update(infoObj, token);
  }

  async getScheme(token) {
    return await this.account.getScheme(token);
  }

  async setupDb() {
    await this.auth.setupDatabase();
    await this.account.setupDatabase();
  }
}
export default User;
