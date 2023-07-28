const User = require("../models/user");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const flash = require("express-flash");
var format = require("date-fns/format");

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/log-in");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  next();
}

// Display list of all messages.
exports.messages_display = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({})
    .sort({ time: -1 })
    .populate("author")
    .exec();
  res.render("index", {
    title: "Home",
    user_in: req.user,
    messages,
    format: format,
  });
});

// Display sign up form on get
exports.sign_up_get = [
  checkNotAuthenticated,
  asyncHandler(async (req, res, next) => {
    res.render("sign-up", { title: "Sign up" });
  }),
];

// Display sign up form on post
exports.sign_up_post = [
  body("first_name", "First must contain at least 1 character")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("last_name", "Last name must contain at least 1 character")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("username")
    .custom(async (value) => {
      const existingUser = await User.findOne({ username: value }).exec();
      console.log(existingUser, "-------------------");
      if (existingUser) {
        throw new Error("There already is a user with this e-mail (username)!");
      } else {
        return true;
      }
    })
    .trim()
    .escape(),
  body("password", "Password must at least 5 characters").isLength({ min: 5 }),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match!");
    } else {
      return true;
    }
  }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        next(err);
      } else {
        const user = new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          username: req.body.username,
          password: hashedPassword,
        });
        if (!errors.isEmpty()) {
          console.log(errors);
          res.render("sign-up", {
            title: "Sign up",
            user: user,
            errors: errors.array(),
          });
          return;
        } else {
          await user.save();
          res.redirect("/log-in");
        }
      }
    });
  }),
];

// Display log in form on get
exports.log_in_get = [
  checkNotAuthenticated,
  asyncHandler(async (req, res, next) => {
    res.render("log-in", { title: "Log in" });
  }),
];

// Display log in form on post
exports.log_in_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in",
  failureFlash: true,
});

// Log out
exports.log_out = asyncHandler(async (req, res, next) => {
  {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  }
});

// Display add message form on get
exports.create_message_get = [
  checkAuthenticated,
  asyncHandler(async (req, res, next) => {
    res.render("create-message", {
      title: "Create message",
      user_in: req.user,
    });
  }),
];

// Display add message form on post
exports.create_message_post = [
  body("title").trim().escape(),
  body("text").trim().escape(),
  asyncHandler(async (req, res, next) => {
    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      time: Date.now(),
      author: req.user,
    });

    await message.save();
    res.redirect("/");
  }),
];

// Display join the club form on get
exports.join_club_get = [
  checkAuthenticated,
  asyncHandler(async (req, res, next) => {
    res.render("join-club", { title: "Join the club", user_in: req.user });
  }),
];

// Display join the club form on post
exports.join_club_post = [
  body("club_password")
    .toLowerCase()
    .custom((value) => {
      if (value !== "belarus") {
        throw new Error(
          "Incorrect password. Hint: it start with a letter 'B'."
        );
      } else {
        return true;
      }
    })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      res.render("join-club", {
        title: "Join the club",
        errors: errors.array(),
      });
      return;
    } else {
      req.user.membership_status = true;
      await req.user.save();
      res.redirect("/");
    }
  }),
];

// Display become admin form on get
exports.become_admin_get = [
  checkAuthenticated,
  asyncHandler(async (req, res, next) => {
    res.render("become-admin", { title: "Become an admin", user_in: req.user });
  }),
];

// Display become admin form on post
exports.become_admin_post = [
  body("admin_password")
    .toLowerCase()
    .custom((value) => {
      if (value !== "minsk") {
        throw new Error("Incorrect password. Hint: it starts with letter 'M'.");
      } else {
        return true;
      }
    })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      res.render("become-admin", {
        title: "Become an admin",
        errors: errors.array(),
      });
      return;
    } else {
      req.user.admin = true;
      await req.user.save();
      res.redirect("/");
    }
  }),
];

// Delete message on post
exports.delete_message = asyncHandler(async (req, res, next) => {
  await Message.findByIdAndRemove(req.body.message_id);
  res.redirect("/");
});
