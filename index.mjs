import express from "express";
import axios from "axios";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import util from "util";

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
  maxAge: -1,
  secure: true,
  httpOnly: true,
  sameSite: "Lax",
};

const requireAuth = async (req, res, next) => {
  const mapiToken = req.cookies.mapiTok;
  if (mapiToken) {
    if (await checkValidity(mapiToken)) {
      next(); // User is authenticated, proceed to the next middleware or route
    } else {
      res.cookie("mapiTok", "", deleteCookie);
      res.redirect("/public/login.html"); // User is not authenticated, redirect to login page
    }
  } else {
    res.redirect("/public/login.html"); // User is not authenticated, redirect to login page
  }
};
app.use("/public", express.static("public"));

app.get("/", requireAuth, (req, res) => {
  res.redirect("/private");
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
app.post("/logout", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (mapiToken) {
    const response = await axios.post(MAPIURL + "/logout", {
      token: mapiToken,
    });
    if (response.data.Response === "Ok") {
      res.cookie("mapiTok", "", deleteCookie);
      res.status(200).json({
        Response: "Ok",
        data: { message: "Logged Out" },
      });
    } else {
      res.status(500).json({ Response: "Error" });
    }
  } else {
    res.status(500).json({ Response: "Error" });
  }
});

app.post("/account/getMyInfo", requireAuth, async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  const response = await axios.post(MAPIURL + "/getMyInfo", {
    token: mapiToken,
  });
  if (response.data.Response === "Ok") {
    res.status(200).json({
      Response: "Ok",
      data: response.data.data,
    });
  } else {
    res.status(500).json({ Response: "Error" });
  }
});
app.use("/private", requireAuth, express.static("private"));

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
