import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import util from "util";
import { layout } from "./dblayout.mjs";
import dotenv from "dotenv";
import User from "./AccessControl/Classes/user.mjs";
import Admin from "./AccessControl/Classes/admin.mjs";
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

const all_tabs = [{id:"home",pretty:"Home"},{id:"dashboard",pretty:"Dashboard"}]
const admin_tabs = [{id:"admin",pretty:"Admin"}]

const user = new User(layout,mysqlConfig);
const admin =  new Admin(layout,mysqlConfig,layout.ADMIN.id);

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

function gettabs(type){
  if( type === "admin"){
    return [...all_tabs, ...admin_tabs];
  }
  return all_tabs;
}
app.use("/public",isAuth, express.static("public"));

app.get("/",await user.user("/public/login.html"), async (req, res) => {
  res.redirect("/home");
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

app.get("/logout", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (mapiToken) {
      await user.logout(mapiToken);
      res.cookie("mapiTok", "", deleteCookie);
      res.redirect("/");
  } else {
    res.redirect("/");
  }
});


app.use("/private",await user.user("/"), express.static("private"));

const ejs = import('ejs');
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


// Define a common route handler function
function handleRoute(tab) {
  return async (req, res) => {
      const mapiToken = req.cookies.mapiTok;
      const type = req.cookies.mapiType;
      const info = await user.getinfo(mapiToken);
      let tabs = gettabs(type);
      res.render("page", {"pages":tabs,"current_page": tab.id, "dir": "pages/", "info": info});
  };
}

// Create routes for all tabs
all_tabs.forEach(async tab => {
  app.get(`/${tab.id}`, await user.user("/"), handleRoute(tab));
});

// Create routes for admin tabs
admin_tabs.forEach(async tab => {
  app.get(`/${tab.id}`, await user.user("/"), await admin.admn("/"), handleRoute(tab));
});

app.get("/profile",await user.user("/"),async(req,res)=>{
  const mapiToken = req.cookies.mapiTok;
  const info = await user.getinfo(mapiToken);
  const type = req.cookies.mapiType;
  let tabs = gettabs(type);
  res.render("page", {"pages":tabs,"current_page": "profile", "dir": "pages/", "info": info});})

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

function showObj(obj) {
  console.log(util.inspect(obj, { depth: null }));
}
