var express = require("express");
const passport = require('passport');

var router = express.Router();

const auth_controller = require("../controllers/auth");

router.get("/register", auth_controller.registration_get);
router.post("/register", auth_controller.registration_post);

router.get("/login", auth_controller.login_get);
router.post("/login", passport.authenticate("local", { failureRedirect: `/login?err=`, failureMessage: "WTAF" }), auth_controller.login_post);

router.post("/logout", auth_controller.logout);

module.exports = router;