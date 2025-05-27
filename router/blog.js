const { Router } = require("express");
const router = Router();
const Blog = require("../models/blog");
const checkAuth = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const Comment = require("../models/comment");

// Set up multer to store files in /public/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-blog", (req, res) => {
  res.render("addBlog", {
    user: req.user,
    currentRoute: "add-blog",
  });
});

router.get("/blog/:id", async (req, res) => {
  const blogId = req.params.id;
  try {
    const blog = await Blog.findById(blogId).populate("createdBy");
    const comments = await Comment.find({ blogId }).populate("createdBy");

    if (!blog) {
      return res.status(404).render("404", { error: "Blog not found" });
    }

    res.render("blog", {
      blog,
      comments,
      user: req.user,
      currentRoute: "blog",
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
});


router.post("/comment/:blogId", checkAuth, async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user.id,
  });
  res.redirect(`/blog/${req.params.blogId}`);
});

router.post(
  "/add-blog",
  checkAuth,
  upload.single("coverPage"),
  async (req, res) => {
    const { title, content } = req.body;
    const coverPage = req.file ? req.file.filename : null;

    try {
      const newBlog = await Blog.create({
        title,
        content,
        coverPage,
        createdBy: req.user.id,
      });

      console.log("New blog created:", newBlog);
      res.redirect("/");
    } catch (error) {
      console.error("Error creating blog:", error);
      res.render("addBlog", {
        error: "Failed to create blog. Please try again.",
      });
    }
  }
);

module.exports = router;
