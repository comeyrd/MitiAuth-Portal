import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import util from "util";
import { layout } from "./dblayout.mjs";
import dotenv from "dotenv";
import User from "./AccessControl/Classes/user.mjs";
import Admin from "./AccessControl/Classes/admin.mjs";
import path from 'path';
import calielRoutes,{get_caliel_obj,caliel_setup,get_caliel_logs,get_all_caliel,get_all_caliel_logs,delete_logger} from './caliel-logger/site/calielRoutes.mjs';

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
const admin_tabs = [{id:"caliel-admin",pretty:"Caliel-Admin"},{id:"admin",pretty:"Admin"}]

const user = new User(layout,mysqlConfig);
const admin =  new Admin(layout,mysqlConfig,layout.ADMIN.id);
await caliel_setup(mysqlConfig);


await user.init(process.env.JWT_KEY);
await admin.init(process.env.JWT_KEY);
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
app.use(bodyParser.urlencoded({ extended: true }))
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


app.get("/profile",await user.user("/"),async(req,res)=>{
  const obj = await build_default_obj(req.cookies.mapiType,req.cookies.mapiTok,"profile");
  res.render("page", obj);
})
app.get("/home",await user.user("/"),async(req,res)=>{
  const id = (await user.decode(req.cookies.mapiTok)).id;
  const obj = await build_default_obj(req.cookies.mapiType,req.cookies.mapiTok,"home");
  obj.caliel =  await get_caliel_obj(id);
  obj.caliel_logs = await get_caliel_logs(id);
  res.render("page", obj);
})
app.get("/dashboard",await user.user("/"),async(req,res)=>{
  const obj = await build_default_obj(req.cookies.mapiType,req.cookies.mapiTok,"dashboard");
  res.render("page", obj);
})
app.get("/admin",await user.user("/"),await admin.admn("/"),async(req,res)=>{
  const obj = await build_default_obj(req.cookies.mapiType,req.cookies.mapiTok,"admin");
  obj.list_users = await admin.listUsers();
  obj.scheme = await admin.listScheme();
  res.render("page", obj);  
})

app.get("/caliel-admin",await user.user("/"),await admin.admn("/"),async(req,res)=>{
  const obj = await build_default_obj(req.cookies.mapiType,req.cookies.mapiTok,"caliel-admin");
  obj.caliel_loggers = await get_all_caliel(await admin.get_id2uname());
  obj.caliel_alllogs = await get_all_caliel_logs();
  res.render("page", obj);
})

app.post("/create-user",await user.user("/"), await admin.admn("/"),async (req, res) => {
  const {username,password,type,originurl} = req.body;
  const scheme = await admin.listScheme();
  let userobj = {};
  Object.keys(scheme[type]).forEach(function(key){
    userobj[key] = req.body[key];
  })
  await user.create(username,password,userobj,type);
  res.redirect(originurl);
});

app.post("/edit-my-info",await user.user("/"),async (req, res) => {
  const {originurl} = req.body;
  const scheme = await user.getScheme(req.cookies.mapiTok);
  let userobj = {};
  Object.keys(scheme).forEach(function(key){
    userobj[key] = req.body[key];
  })
  await user.editinfo(req.cookies.mapiTok,userobj);
  res.redirect(originurl);
});
app.post("/update-user-pass",await user.user("/"),async (req, res) => {
  const {originurl,password} = req.body;
  await user.update_password(req.cookies.mapiTok,password);
  res.redirect(originurl);
});

app.post("/update-username", await user.user("/"), async (req, res) => {//TODO fix and find a way to manage errors
  const { originurl, username } = req.body;
  try {
    await user.update_username(req.cookies.mapiTok, username);
  } catch(e) {
    console.log(e);
  }
  res.redirect(originurl);
});

app.post("/delete-user",await user.user("/"), await admin.admn("/"),async (req, res) => {
  const {userid,originurl} = req.body;
  try{
  await admin.delete_user(userid);
  await delete_logger(userid);
}catch{
  console.log("error");
}
  res.redirect(originurl);
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

function showObj(obj) {
  console.log(util.inspect(obj, { depth: null }));
}
app.use('/caliel',await user.user("/"), calielRoutes); 

async function build_default_obj(type,token,current){
  const info = await user.getinfo(token);
  const tabs = gettabs(type);
  return {"pages":tabs,"current_page": current,"dir":"pages/","info":info,"originurl":"/"+current}
}