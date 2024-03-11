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

exports.login_post = (err, req, res, next) => {
	const returnTo = req.session.returnTo;
	req.session.returnTo = undefined;

	if (err) {
		res.render("auth/login", { 
			title: "Log In",
			error: err 
		}); 

		return;
	}

	res.redirect(returnTo || "/");
}

exports.logout = (req, res, next) => {
	req.logout();
	res.redirect(req.query.next);
}