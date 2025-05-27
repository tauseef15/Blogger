const express = require("express");
const app = express();
require("dotenv").config();
const port = 3000;
const connect = require("./conn.js");
const userRouter = require("./router/user.js");
const blogRouter = require("./router/blog.js");
const checkAuth = require("./middlewares/auth.js");
const user = require("./models/user.js");
const cookieParser = require("cookie-parser");
const Blog = require("./models/blog.js");

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkAuth); // apply globally

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.error = null; // optional default
  next();
});

app.get("/", async (req, res) => {
  try {
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 }).populate("createdBy");

    res.render("home", {
      user: req.user || null,
      currentRoute: "home",
      blogs: allBlogs,
    });
  } catch (error) {
    console.error("Error loading blogs:", error);
  }
});

app.use("/user", userRouter);
app.use("/", blogRouter);
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
