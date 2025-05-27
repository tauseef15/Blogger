const express = require("express");
const app = express();
require("dotenv").config();
const connect = require("./conn.js");
const userRouter = require("./router/user.js");
const blogRouter = require("./router/blog.js");
const checkAuth = require("./middlewares/auth.js");
const cookieParser = require("cookie-parser");
const Blog = require("./models/blog.js");
const path = require("path");
const port = process.env.PORT || 3000;


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply authentication middleware globally
app.use(checkAuth);

// Middleware to pass user & error to views
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.error = null;
  next();
});

// Home route
app.get("/", async (req, res) => {
  try {
    const allBlogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .populate("createdBy");

    res.render("home", {
      user: req.user || null,
      currentRoute: "home",
      blogs: allBlogs,
    });
  } catch (error) {
    console.error("Error loading blogs:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Routes
app.use("/user", userRouter);
app.use("/", blogRouter);

// Start the server locally, but export app for Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}

module.exports = app;
