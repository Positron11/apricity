var express = require("express");
const passport = require('passport');

var router = express.Router();

const authMiddleware = require("../middleware/auth_middleware")
const auth_controller = require("../controllers/auth");

router.get("/register", auth_controller.registration_get);
router.post("/register", auth_controller.registration_post);

router.get("/login", auth_controller.login_get);
router.post("/login", passport.authenticate("local", { failWithError: true }), auth_controller.login_success_post, auth_controller.login_error_post);

router.post("/logout", auth_controller.logout);

router.get("/account", authMiddleware.sessionAuthCheck(), auth_controller.account_get);
router.post("/account/update-email", authMiddleware.sessionAuthCheck(), auth_controller.update_email);
router.post("/account/update-password", authMiddleware.sessionAuthCheck(), auth_controller.update_password);
router.post("/account/delete-user", authMiddleware.sessionAuthCheck(), auth_controller.delete_user);

module.exports = router;