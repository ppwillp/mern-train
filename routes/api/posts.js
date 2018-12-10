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

// @route     POST api/posts/like/:id
// @desc      Like Post
// @access    Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: "user already liked this post" });
          }

          //add user id to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "post not found" }));
    });
  }
);

// @route     POST api/posts/unlike/:id
// @desc      unlike Post
// @access    Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notyetliked: "you have not liked this post yet" });
          }

          //get reomve inded
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //splice out of array
          post.likes.splice(removeIndex, 1);

          post.save().then(post => {
            res.json(post);
          });
        })
        .catch(err => res.status(404).json({ postnotfound: "post not found" }));
    });
  }
);

// @route     POST api/posts/comment/:id
// @desc      add coment to post
// @access    Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      //if any errors, send 400 w/ object
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        //add to comments array
        post.comments.unshift(newComment);

        //save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

// @route     DELETE api/posts/comment/:id/:comment_id
// @desc      remove coment from post
// @access    Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Post.findById(req.params.id)
      .then(post => {
        //check if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: "Comment does not exist" });
        }

        //get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        //splice comment from array
        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

module.exports = router;
