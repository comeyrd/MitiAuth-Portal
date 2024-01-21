import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import util from "util";
import User from "./user.mjs";
import Admin from "./admin.mjs";
const app = express();
const port = 8102;

const user = new User();
const admin =  new Admin();
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

const requireAuth = async (req, res, next) => {
  const mapiToken = req.cookies.mapiTok;
  if (mapiToken) {
    try{
    if (await checkValidity(mapiToken)) {
      next(); // User is authenticated, proceed to the next middleware or route
    } else {
      res.cookie("mapiTok", "", deleteCookie);
      res.redirect("/public/login.html"); // User is not authenticated, redirect to login page
    }}catch(error){
      res.redirect("/public/login.html"); // User is not authenticated, redirect to login page
    }
  } else {
    res.redirect("/public/login.html"); // User is not authenticated, redirect to login page
  }
};

const isAuth = async (req, res, next) => {
  const mapiToken = req.cookies.mapiTok;
  if (mapiToken) {
    try{
    if (await checkValidity(mapiToken)) {
      res.redirect("/"); // User is authed redirect to login page
    } else {
      next();
    }}catch(error){
        next();
    }
  } else {
    next();
  }
};
app.use("/public", isAuth, express.static("public"));

app.get("/", requireAuth, async (req, res) => {
  res.redirect("/private");
  //await admin.listUsers();//TODO FOR TEST PURPOSES
});

app.post("/login", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (!(await checkValidity(mapiToken, res))) {
    const { login, password } = req.body;
    await mapiHandl(res, async () => {
        const response = await user.login(login, password);
        res.cookie("mapiTok", response.token, cookieSett);
        return { message: "Logged In" };
    });
}});

app.post("/logout", async (req, res) => {
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

app.post("/account/getMyInfo", requireAuth, async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
    await mapiHandl(res,async()=>{
      return await user.getinfo(mapiToken);
    });
});
app.get("/account/get-scheme", requireAuth, async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  await mapiHandl(res,async()=>{
    return await user.getScheme(mapiToken);
  });
});

app.use("/private", requireAuth, express.static("private"));

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

async function checkValidity(mapiToken, res) {
  if (mapiToken) {
    try{
    const response = await user.validate(mapiToken)
    return !!(response.id);
    }
    catch{
      return false;
    }
  } else {
    return false;
  }
}

function showObj(obj) {
  console.log(util.inspect(obj, { depth: null }));
}
