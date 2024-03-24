const passport = require('passport');
const { body, validationResult } = require("express-validator");

const User = require("../models/user");

exports.registration_get = (req, res, next) => {
	if (req.query.next) { req.session.returnTo = req.query.next }
	res.render("auth/registration", { 
		title: "Register" 
	});
}

exports.registration_post = [
	body("username", "Username too long/short - length ∈ [3, 20]").trim().isLength({ min: 3, max: 20 }).custom(value => {
		return User.findOne({ username: value })
		.then(result => { return result ? Promise.reject("A user with this name already exists.") : true }) 
	}),

	body("password", "Password too short - length > 7").isLength({ min: 8 }),

	body("confirm", "Password doesn't match.").custom((value, {req, loc, path}) => {
		return value == req.body.password || Promise.reject();
	}),

	body("captcha", "Incorrect captcha response.").trim().custom((value, {req, loc, path}) => {
		return value == eval(req.body.captchaQuestion) || Promise.reject();
	}),
	
	(req, res, next) => {
		const returnTo = req.session.returnTo;
		req.session.returnTo = undefined;
		
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render("auth/registration", { 
				title: "Register",
				errors: errors.array() 
			}); 

			return;
		}

		User.register({ username: req.body.username, active: true }, req.body.password)
		.then( result => {
			passport.authenticate("local")(req, res, () => { 
				res.redirect(returnTo || "/");
			});
		}, err => { return next(err); });
	}
]

exports.login_get = (req, res, next) => {
	if (req.query.next) { req.session.returnTo = req.query.next }
	res.render("auth/login", { title: "Log In" });
}

exports.login_success_post = (req, res, next) => {
	const returnTo = req.session.returnTo;
	req.session.returnTo = undefined;
	res.redirect(returnTo || "/");
}

exports.login_error_post = (err, req, res, next) => {
	res.render("auth/login", { 
		title: "Log In",
		error: err 
	});
}

exports.logout = (req, res, next) => {
	req.logout();
	res.redirect(req.query.next);
}

exports.account_get = (req, res, next) => {
	if (req.query.next) { req.session.returnTo = req.query.next }
	res.render("auth/account", { 
		title: "Account" 
	});
}

exports.update_email = (req, res, next) => {
	req.user.updateOne({ email: req.body.email }).then(() => {
		res.redirect("/account#EmailForm");
	});
}

exports.update_password = [
	body("oldpass").custom(async (value, { req, loc, path }) => {
		const error = (await req.user.authenticate(value)).error;
		return error ? Promise.reject("Incorrect old password") : true;
	}),
	body("newpass", "Password too short - length > 7").isLength({ min: 8 }),
	body("confirmpass").custom((value, {req, loc, path}) => {
		return value == req.body.newpass || Promise.reject("Old pass. ≠ new pass.");
	}),

	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			req.session.errors = errors.array();
			res.redirect("/account#PasswordForm");
			return;
		}

		req.user.changePassword(req.body.oldpass, req.body.newpass).then(() => {
			res.redirect("/account"); 
		});
	}
]

exports.delete_user = [
	body("password").custom(async (value, { req, loc, path }) => {
		const error = (await req.user.authenticate(value)).error;
		return error ? Promise.reject("Incorrect old password") : true;
	}),

	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			req.session.errors = errors.array();
			res.redirect("/account#SuicideForm");
			return;
		}

		req.user.deleteOne().then(() => {
			res.redirect("/"); 
		});
	}
]