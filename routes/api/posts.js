const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//validation
const validatePostInput = require("../../validation/post");

//Post model
const Post = require("../../models/Post");

//Profile Model
const Profile = require("../../models/Profile");

// @route     GET api/posts
// @desc      Show all Posts
// @access    Public
router.get("/", (req, res, next) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
});

// @route     GET api/posts/:id
// @desc      Show post by id
// @access    Public
router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found with that ID" })
    );
});

// @route     POST api/posts
// @desc      Create Post
// @access    Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      //if any errors, send 400 w/ object
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.body.user
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route     DELETE api/posts/:id
// @desc      Delete Post
// @access    Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Post.findById(req.params.id).then(post => {
      console.log(post);
      post
        .remove()

        .then(() => {
          res.status(200).json({ post: "Post deleted" });
        })
        .catch(err => {
          res.status(404).json({ err: "post not found" });
        });
    });
  }
);

module.exports = router;
