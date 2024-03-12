const { body, validationResult } = require("express-validator");
const slugify = require("slugify");
const he = require("he");

const Note = require("../models/note");

exports.index = (req, res, next) => {
	const perPage = 10;
	Note.countDocuments({})
	.then(count => {
		const paginateOptions = {
			limit: perPage,
			sort: { published: "asc" },
			page: req.query.page || Math.ceil(count / perPage)
		}
	
		Note.paginate({ }, paginateOptions)
		.then(result => {
			res.render("notes/index", { 
				title: "Notes",
				perPage: perPage,
				page: result.page,
				pageCount: result.totalPages,
				notes: (result.docs).reverse()
			});
			
		}, err => { return next(err); });
	});
}

exports.detail = (req, res, next) => {
	Note.findOne({ slug: req.params.slug }).populate({ 
		path: "comments", 
		match: { parent: undefined }, 
		options: { sort: { created_date: -1 } } 
	}).then(note => {
		if (note === null) {
			const error = new Error("This note does not exist");
			error.status = 404;
			return next(error);
		}

		res.render("notes/detail", { 
			title: note.title, 
			note: note
		});

	}, err => { return next(err); });
}

exports.create_get = (req, res, next) => {
	res.render("notes/editor", { 
		title: "Create",
		action: "Create"
	});
}

exports.create_post = [
	body("title", "Must have title").trim().isLength({ min: 1 }).custom(value => {
		return Note.countDocuments({ slug: slugify(he.decode(value), { lower: true, strict: true }) })
		.then(count => { return count > 0 ? Promise.reject("A note with this title already exists") : true });
	}).escape(),

	body("content", "Must have content").trim().isLength({ min: 1 }).escape(),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render("notes/editor", {
				title: "Create",
				action: "Create",
				formData: req.body,
				errors: errors.array()
			}); 
			
			return;
		}

		Note.create({ title: req.body.title, content: req.body.content })
		.then(note => { 
			res.redirect(`/notes/${note.slug}`) 
		}, err => { return next(err); });
	}
]

exports.edit_get = (req, res, next) => {
	Note.findOne({ slug: req.params.slug })
	.then(note => {
		if (note === null) {
			const error = new Error("This note does not exist");
			error.status = 404;
			return next(error);
		}

		res.render("notes/editor", { 
			title: "Edit",
			action: "Edit",
			formData: note
		});

	}, err => { return next(err) });
}

exports.edit_post = [
	body("title", "Must have title").trim().isLength({ min: 1 }).custom((value, { req }) => { 
		const slug = slugify(he.decode(value), { lower: true, strict: true });
		return slug === req.params.slug ? true : Note.countDocuments({ slug: slug })
		.then(count => { return count > 0 ? Promise.reject("A note with this title already exists") : true }) 
	}).escape(),

	body("content", "Must have content").trim().isLength({ min: 1 }).escape(),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render("notes/editor", {
				title: "Edit Note",
				action: "Edit",
				formData: req.body,
				errors: errors.array()
			}); 
			
			return;
		}
		
		Note.findOne({ slug: req.params.slug })
		.then(async result => {
			result.title = req.body.title;
			result.content = req.body.content;
			await result.save();

			res.redirect(`/notes/${result.slug}`); 
			
		}, err => { return next(err); });
	}
]

exports.delete_get = (req, res, next) => {
	Note.findOne({ slug: req.params.slug })
	.then(result => {
		if (result === null) {
			const error = new Error("This note does not exist");
			error.status = 404;
			return next(error);
		}

		res.render("notes/delete", { 
			title: "Delete",
			note: result
		});

	}, err => { return next(err) });
}

exports.delete_post = (req, res, next) => {
	Note.findOneAndDelete({ slug: req.params.slug })
	.then(note => { 
		res.redirect("/notes")
	}, err => { return next(err); });
}