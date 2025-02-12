const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Post model
const Post = require("../../models/Post");
//Profile model
const Profile = require("../../models/Profile");

//Validation
const validatePostInput = require("../../validation/post");

//@route  GET api/posts/test
//@desc   Tests post routes
//@access Public

router.get("/test", (req, res) => {
  res.json({
    msg: "posts works"
  });
});

//@route  GET api/posts
//@desc   Get posts
//@access Public

router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostfsound: "No posts found" }));
});

//@route  GET api/posts/:id
//@desc   Get post by id
//@access Public

router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found with this id" })
    );
});

//@route  POST api/posts
//@desc   Create post
//@access Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isEmpty } = validatePostInput(req.body);
    //Check validation
    if (!isValid) {
      //If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

//@route  DELETE api/posts/:id
//@desc   Delete Post
//@access Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check for post owner
          if (post.user.id.toString() !== req.user.id) {
            res.status(401).json({ notauthorized: "User not authorized" });
          }

          //Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

//@route  POST api/posts/like/:id
//@desc   Like Post
//@access Private

router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            //check whether this user has already liked this post or not
            post.likes.filter(like => like.user.toString() === req.body.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this post" });
          }

          //Add user id to the like array
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

//@route  POST api/posts/unlike/:id
//@desc   UnLike Post
//@access Private

router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            //check whether this user has already liked this post or not
            post.likes.filter(like => like.user.toString() === req.body.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You have not yet liked the post" });
          }

          //Get which like to remove
          const removeIdx = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //Splice from the array
          post.likes.splice(removeIdx, 1);

          //Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

//@route  POST api/posts/comment/:id
//@desc   Comment Post
//@access Private

router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: true }),
  (req, res) => {
    const { errors, isEmpty } = validatePostInput(req.body);
    //Check validation
    if (!isValid) {
      //If any errors, send 400 with errors object
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

        //Add to comments array
        post.comments.unshift(newComment);

        //Save
        post.save().then(post => res.json(post));
      })
      .catch(res.status(404).json({ postnotfound: "No post found" }));
  }
);
//@route  DELETE api/posts/comment/:id/:comment_id
//@desc   Delete Post
//@access Private

router.delete(
  "/comment/:id/comment_id",
  passport.authenticate("jwt", { session: true }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        //Check if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexist: "Comment does not exist" });
        }

        //Get reamove index
        const removeIdx = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        //Splice it from the array
        post.comments.splice(removeIdx, 1);

        //Save
        post.save().then(post => res.json(post));
      })
      .catch(res.status(404).json({ postnotfound: "No post found" }));
  }
);

module.exports = router;
