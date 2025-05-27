const { Router } = require("express");

const router = Router();
const User = require("../models/user");
router.get("/signup", (req, res) => {
  res.render("signup", {
    currentRoute: "signup",
  });
});


router.get("/login", (req, res) => {
  res.render("login", {
    currentRoute: "login",
  });
});


router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).send("All fields are required");
  }
  try {
    await User.create({ fullName, email, password });
    return res.redirect("/user/login");
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === 11000) {
      return res.status(400).send("Email already exists");
    }
    return res.status(500).send("Internal Server Error");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("All fields are required");
  }
  try {
    const token = await User.matchPasword(email, password);
    console.log("User logged in:", token);
    return res.cookie("token", token, { httpOnly: true }).redirect("/");
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.render("login", { error: "Invalid email or password" });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});
module.exports = router;
