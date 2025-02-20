const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

//Load profile model
const Profile = require("../../models/Profile");

//Load user model
const User = require("../../models/User");

//@route  GET api/profile/test
//@desc   Tests profile routes
//@access Public

router.get("/test", (req, res) => {
  res.json({
    msg: "profile works"
  });
});

//@route  GET api/profile
//@desc   Get current user's profile
//@access Private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "No profile exists for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route  GET api/profile/all
//@desc   Get all the profile
//@access Public

router.get("/all", (req, res) => {
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: "There are no profiles" }));
});

//@route  GET api/profile/user/:user_id
//@desc   Get profile by userId
//@access Public

router.get("/user/:user_id", (req, res) => {
  Profile.findOne({ handle: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

//@route  GET api/profile/handle/:handle
//@desc   Get profile by handle
//@access Public

router.get("/handle/:handle", (req, res) => {
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

//@route  POST api/profile
//@desc   Create or Edit current user's profile
//@access Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    //Get fields
    const profilefields = {};
    profilefields.user = req.user.id;
    if (req.body.handle) {
      profilefields.handle = req.body.handle;
    }
    if (req.body.company) {
      profilefields.company = req.body.company;
    }
    if (req.body.website) {
      profilefields.website = req.body.website;
    }
    if (req.body.location) {
      profilefields.location = req.body.location;
    }
    if (req.body.bio) {
      profilefields.bio = req.body.bio;
    }
    if (req.body.status) {
      profilefields.status = req.body.status;
    }
    if (req.body.githubusername) {
      profilefields.githubusername = req.body.githubusername;
    }

    //Skills - split into an array
    if (typeof req.body.skills !== "undefined") {
      profilefields.skills = req.body.skills.split(",");
    }

    //Social
    profilefields.social = {};
    if (req.body.youtube) {
      profilefields.social.youtube = req.body.youtube;
    }
    if (req.body.twitter) {
      profilefields.social.twitter = req.body.twitter;
    }
    if (req.body.facebook) {
      profilefields.social.facebook = req.body.facebook;
    }
    if (req.body.linkedin) {
      profilefields.social.linkedin = req.body.linkedin;
    }
    if (req.body.instagram) {
      profilefields.social.instagram = req.body.instagram;
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //This means update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profilefields },
          { new: true }
        ).then(profile => {
          res.json(profile);
        });
      } else {
        //Create new profile

        //Check if handle exists
        Profile.findOne({ handle: profilefields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }
          //Save profile
          new Profile(profilefields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

//@route  POST api/profile/experience
//@desc   Add experience to profile
//@access Private

router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //Add to experience array
      profile.experience.unshift(newExp);
      profile.save().then(profile => res.json(profile));
    });
  }
);

//@route  POST api/profile/education
//@desc   Add education to profile
//@access Private

router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //Add to experience array
      profile.education.unshift(newEdu);
      profile.save().then(profile => res.json(profile));
    });
  }
);

//@route  DELETE api/profile/experience/:exp_id
//@desc   Delete experience to profile
//@access Private

router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //Get remove index
        const removeIdx = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        //Splice out of array
        profile.experience.splice(removeIdx, 1);

        //Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route  DELETE api/profile/education/:edu_id
//@desc   Delete education to profile
//@access Private

router.delete(
  "/education/:education_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //Get remove index
        const removeIdx = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        //Splice out of array
        profile.education.splice(removeIdx, 1);

        //Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route  DELETE api/profile/profile
//@desc   Delete user and profile
//@access Private

router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

module.exports = router;
