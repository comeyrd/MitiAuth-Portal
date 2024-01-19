import express from "express";
import axios from "axios";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import util from "util";
import Acontrol from "./acontrol.mjs";

const app = express();
const port = 8102;

const acontrol = new Acontrol();


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

app.get("/", requireAuth, (req, res) => {
  res.redirect("/private");
});

app.post("/login", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (!(await checkValidity(mapiToken, res))) {
    const { login, password } = req.body;
    const response = await acontrol.login(login,password);
    res.cookie("mapiTok", response.token, cookieSett);
    res.status(200).json({
      Response: "Ok",
      data: { message: "Logged In" },
    });
  } else {
    res.status(200).json({
      Response: "Ok",
      data: { message: "Logged In" },
    });
  }
});

app.post("/logout", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (mapiToken) {
      await acontrol.logout(mapiToken);
      res.cookie("mapiTok", "", deleteCookie);
      res.status(200).json({
        Response: "Ok",
        data: { message: "Logged Out" },
      });
   } else {
    res.status(500).json({ Response: "Error" });
  }
});

app.post("/account/getMyInfo", requireAuth, async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  try {
    const data = await acontrol.getinfo(mapiToken);
    console.log(data);
    res.status(200).json({
      Response: "Ok",
      data: {uInfo:data},
    });
  } catch (error) {
    res.status(500).json({
      Response: "Api Error",
      data: { message: error.message },
    });
  }
});
app.get("/account/get-scheme", requireAuth, async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  //TODO
  try {
    const response = await acontrol.getScheme(mapiToken);
    res.status(200).json({
      Response: "Ok",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      Response: "Api Error",
      data: { message: error.message },
    });
  }
});
app.post("/account/create", requireAuth, async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  try {
    //TODO
    const response = await axios.post(MAPIURL + "/auth/register", {
      token: mapiToken,
      create: req.body,
    });
    if (response.data.Response === "Ok") {
      res.status(200).json({
        Response: "Ok",
        data: response.data.data,
      });
    } else {
      res.status(500).json({ Response: "Error" });
    }
  } catch (error) {
    res.status(500).json({
      Response: "Api Error",
      data: { message: error.message, api: error.response.data.data.type },
    });
  }
});
app.use("/private", requireAuth, express.static("private"));

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

async function checkValidity(mapiToken, res) {
  if (mapiToken) {
    try{
    const response = await acontrol.validate(mapiToken)
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
