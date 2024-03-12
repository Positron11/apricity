const { body, validationResult } = require("express-validator");

const Comment = require("../models/comment");

exports.comment_create = [
	body("note", "Invalid note ID.").isMongoId(),
	body("author", "Invalid author ID.").isMongoId(),
	body("parent", "Invalid parent ID.").optional().isMongoId(),
	body("content", "Invalid content.").trim().isLength({ min: 1 }).escape(),
		
	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) { return res.redirect("back"); } // if errors, reload (jank, but i need to sleep)

		Comment.create({ 
			author: req.body.author,
			note: req.body.note,
			parent: req.body.parent,
			content: req.body.content

		}).then(
			async result => { 
				await result.populate("note", "slug");
				res.redirect(`${result.note.url}#${result.parent ? result.parent : result._id}`) 
			}, 
			err => { return next(err); }
		);
	}
]

exports.comment_delete = (req, res, next) => {
	Comment.findOne({ _id: req.params.id }).then(
		async result => {
			if (!req.user.roles.includes("superuser") && !req.user._id.equals(result.author._id)) { 
				const error = new Error("You are not the author of the comment you attempted to delete");
				error.status = 403;
				return next(error);
			}

			await result.deleteOne();
			await result.populate("note", "slug");

			res.redirect(`${result.note.url}#${result.parent ? result.parent : "Comments"}`) 
		},
		err => { return next(err); }
	);
}

exports.comment_edit = [
	body("content", "Invalid content.").trim().isLength({ min: 1 }).escape(),
		
	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) { return res.redirect("back"); } // if errors, reload (jank, but i need to sleep)

		Comment.findOne({ _id: req.params.id }).then(
			async result => {
				if (!(req.user._id.equals(result.author._id))) { 
					const error = new Error("You are not the author of the comment you attempted to edit");
					error.status = 403;
					return next(error);
				}

				result.content = req.body.content;
				await result.save();

				await result.populate("note", "slug");
				res.redirect(`${result.note.url}#${result._id}`) 
			}, 
			err => { return next(err); }
		);
	}
]