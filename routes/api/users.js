const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//Load User Model
const User = require('../../models/User');

// @route     GET api/users/test
// @desc      Tests users routes
// @access    Public
router.get('/test', (req, res) => {
  res.json({
    msg: "Users works"
  });
});

// @route     GET api/users/register
// @desc      register user
// @access    Public
router.post('/register', (req, res, next) => {
 const { errors, isValid } = validateRegisterInput(req.body);

 //check validation
 if(!isValid) {
    return res.status(400).json(errors);
 }

  User.findOne({ email: req.body.email })
    .then(user => {
      if(user) {
        return res.status(400).json({email: 'Email already exists'});
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200', //size
          r: 'pg', //rating
          d: 'mm' //default
        });

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar: avatar,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) {
              throw err;
            } else {
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  res.json(user);
                })
                .catch(err => {
                  console.log(err);
                })
            }
          })
        })
      }
    })
    .catch(err => {
      console.log(err);
    });
});

// @route     GET api/users/login
// @desc      login user / return jwt
// @access    Public
router.post('/login', (req, res, next) => {

  const { errors, isValid } = validateLoginInput(req.body);

  //check validation
  if(!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  //find user by email
  User.findOne({email: email})
    .then(user => {
      //check for user
      if(!user) {
        errors.email = "User not found";
        return res.status(404).json(errors);
      } else {
        //check password
        bcrypt.compare(password, user.password)
          .then(isMatch => {
            if(isMatch) {
              //user matched
              //creating jwt paylad
              const payload = {
                id: user.id,
                name: user.name,
                avatar: user.avatar
              };
            //sign token
              jwt.sign(
                payload, 
                keys.secretOrKey, 
                {expiresIn: 3600}, 
                (err, token) => {
                  res.json({
                    success: true,
                    token: 'Bearer ' + token
                  });
              });
            } else {
              errors.password = 'Password incorrect';
              return res.status(400).json(errors);
            }

          })
      }
    })
});

// @route     GET api/users/current
// @desc      return current user
// @access    Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  console.log("/current reached");
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  });
});

module.exports = router;