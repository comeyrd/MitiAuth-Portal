import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import util from "util";
import { layout } from "./dblayout.mjs";
import dotenv from "dotenv";
import User from "./user.mjs";
import Admin from "./admin.mjs";
import calielRoutes from "../caliel-autoqr/caliel-logger/site/calielRoutes.js"
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8102;

dotenv.config();

const mysqlConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const user = new User(layout,mysqlConfig);
const admin =  new Admin(layout,mysqlConfig);

await user.init();
await admin.init();

const mapiHandl = async (res, dataCallback) => {
  try {
    const data = await dataCallback();
    res.status(200).json({
      Response: "Ok",
      data: data || {}, 
    });
  } catch (error) {
    res.status(500).json({
      Response: "Api Error",
      data: { message: error.message },
    });
  }
};

app.use(bodyParser.json());
app.use(cookieParser());
const cookieSett = {
  maxAge: 3 * 24 * 60 * 60 * 1000,
  secure: true,
  httpOnly: true,
  sameSite: "Lax",
};
const deleteCookie = {
  maxAge: -1,
  secure: true,
  httpOnly: true,
  sameSite: "Lax",
};



const isAuth = async (req, res, next) => {
  const mapiToken = req.cookies.mapiTok;
  if (mapiToken) {
    try {
      if (await user.validate(mapiToken)) {
        res.redirect("/"); // User is authed redirect to login page
      } else {
        next();
      }
    } catch (error) {
      next();
    }
  } else {
    next();
  }
};

app.use("/public",isAuth, express.static("public"));

app.get("/",await user.user("/public/login.html"), async (req, res) => {
  res.redirect("/private");
});

app.post("/login", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (!(await user.validate(mapiToken))) {
    const { login, password } = req.body;
    await mapiHandl(res, async () => {
      const response = await user.login(login, password);
      res.cookie("mapiTok", response.token, cookieSett);
      res.cookie("mapiType", response.type, cookieSett);
      return { message: "Logged In" };
    });
  } else {
    await mapiHandl(res, async () => {
      return { message: "Already Logged In" };
    });
  }
});

app.post("/logout",await user.user("/"), async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (mapiToken) {
    await mapiHandl(res,async()=>{
      await user.logout(mapiToken);
      res.cookie("mapiTok", "", deleteCookie);
      return { message: "Logged Out" };
    });
   } else {
    res.status(500).json({ Response: "Error" });
  }
});

app.post("/account/getMyInfo",await user.user("/"), async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
    await mapiHandl(res,async()=>{
      return await user.getinfo(mapiToken);
    });
});
app.get("/account/get-scheme",await user.user("/"), async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  await mapiHandl(res,async()=>{
    return await user.getScheme(mapiToken);
  });
});

app.use("/private", await user.user("/"), express.static("private"));

const ejs = import('ejs');
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


app.use("/private/caliel", await user.user("/"), calielRoutes); 



app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});


function showObj(obj) {
  console.log(util.inspect(obj, { depth: null }));
}
