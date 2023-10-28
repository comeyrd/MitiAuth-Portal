import express from "express";
import axios from "axios";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import util from "util";
import { dirname } from "path";

const app = express();
const port = 8102;

const MAPIURL = "https://fmapi.ceyraud.com";

app.use(bodyParser.json());
app.use(cookieParser());
const cookieSett = {
  maxAge: 3 * 24 * 60 * 60 * 1000,
  secure: true,
  httpOnly: true,
  sameSite: "Lax",
};
const deleteCookie = {
  expires: new Date(0),
  secure: true,
  httpOnly: true,
  sameSite: "Lax",
};

const requireAuth = async (req, res, next) => {
  const mapiToken = req.cookies.mapiTok;
  if (await checkValidity(mapiToken)) {
    next(); // User is authenticated, proceed to the next middleware or route
  } else {
    res.cookie("mapiTok", "", deleteCookie);
    res.redirect("/public/login.html"); // User is not authenticated, redirect to login page
  }
};

app.get("/", requireAuth, async (req, res) => {
  res.redirect("/access");
});

app.get("/access", requireAuth, async (req, res) => {
  res.status(200).json({ authorized: "true" });
});

app.post("/login", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (!(await checkValidity(mapiToken, res))) {
    const { login, password } = req.body;
    const response = await axios.post(MAPIURL + "/login", {
      login: login,
      password: password,
    });

    if (response.data.Response === "Ok") {
      res.cookie("mapiTok", response.data.data.token, cookieSett);
      res.status(200).json({
        Response: "Ok",
        data: { message: "Logged In" },
      });
    } else {
      res.status(500).json({
        Response: "Api Error",
        data: { message: response.data.data.type },
      });
    }
  } else {
    res.status(200).json({
      Response: "Ok",
      data: { message: "Logged In" },
    });
  }
});

app.use("/public", express.static("public"));

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

async function checkValidity(mapiToken, res) {
  if (mapiToken) {
    const response = await axios.post(MAPIURL + "/validate", {
      token: mapiToken,
    });
    return response.data.Response === "Ok";
  } else {
    return false;
  }
}

function showObj(obj) {
  console.log(util.inspect(obj, { depth: null }));
}
