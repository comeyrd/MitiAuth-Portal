import express from "express";
import axios from "axios";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import util from "util";

const app = express();
const port = 8102;

const MAPIURL = "https://fmapi.ceyraud.com";
//const MAPIURL = "http://localhost:8101";

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

const isAuth = async (req, res, next) => {
  const mapiToken = req.cookies.mapiTok;
  if (mapiToken) {
    if (await checkValidity(mapiToken)) {
      res.redirect("/"); // User is not authenticated, redirect to login page
    } else {
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
    const response = await axios.post(MAPIURL + "/auth/login", {
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
    const response = await axios.post(MAPIURL + "/auth/logout", {
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
  try {
    const response = await axios.post(MAPIURL + "/account/get-info", {
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
  } catch (error) {
    res.status(500).json({
      Response: "Api Error",
      data: { message: error.message },
    });
  }
});
app.get("/account/get-scheme", requireAuth, async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  try {
    const response = await axios.post(MAPIURL + "/account/get-scheme", {
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
    const response = await axios.post(MAPIURL + "/auth/validate", {
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
