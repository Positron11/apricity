require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const session = require("cookie-session");
const url = require("url");

const authMiddleware = require("./middleware/auth_middleware");

const authRouter = require("./routes/auth");
const indexRouter = require("./routes/index");
const notesRouter = require("./routes/notes");

const User = require("./models/user");

const app = express();

const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const connect_db = async () => { return await mongoose.connect(process.env.MONGODB_URL); }

connect_db().then(conn => {
	console.log(`MongoDB connected: ${conn.connection.host}`);
	app.listen(() => console.log("Listening for requests"));
}).catch(err => console.log(err));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false },
	secret: process.env.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(authMiddleware.sessionAuthData);

app.use(function(req, res, next) {
	res.locals.url = url.parse(req.originalUrl || req.url).pathname;
	return next();
});

app.use(express.static(path.join(__dirname, "public")));

app.use("/", authRouter);
app.use("/", indexRouter);
app.use("/notes", notesRouter);

app.use(function(req, res, next) {
	next(createError(404));
});

app.use(function(req, res, next) {
	res.locals.protocol = req.protocol;
	res.locals.host = req.get("host");
	res.locals.url = (new URL(req.originalUrl || req.url)).pathname;
	return next();
});

app.use(function(err, req, res, next) {
	res.locals.status = err.status;
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	res.status(err.status || 500);
	res.render("error", {
		title: `Error ${err.status}`
	});
});

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = app;
