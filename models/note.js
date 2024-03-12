const mongoose = require("mongoose");
const slugify = require("slugify");
const MarkdownIt = require("markdown-it");
const plainText = require('markdown-it-plain-text');
const mongoosePaginate = require("mongoose-paginate-v2");
const he = require("he");

const Schema = mongoose.Schema;

const Comment = require("./comment")

const md = new MarkdownIt();
md.use(plainText);

const NoteSchema = new Schema({
	slug: { type: String, required: true, unique: true },
	title: { type: String, required: true },
	content: { type: String, required: true }
}, { timestamps: { createdAt: "published", updatedAt: "edited" } });

NoteSchema.plugin(mongoosePaginate);

NoteSchema.virtual("url").get(function() {
	return `/notes/${this.slug}`;
});

NoteSchema.virtual("preview").get(function() {
	return (this.content).slice(0, 300) + (" ...").repeat(this.content.length > 500);
});

NoteSchema.virtual("comments", {
	ref: "Comment",
	localField: "_id",
	foreignField: "note"
});

NoteSchema.pre("validate", function(next) {
	console.log("Pre: " + this.title);
	this.slug = slugify(he.decode(this.title), { lower: true, strict: true });
	next();
});

NoteSchema.pre("findOneAndDelete", async function(next) {
	const note = await this.model.findOne(this.getQuery());
	await Comment.deleteMany({ note: note._id });
	next();
});

NoteSchema.methods.renderContent = function() {
	return md.render(this.content);
}

NoteSchema.methods.renderPreview = function() {
	md.render(this.preview);
	return md.plainText;
}

module.exports = mongoose.model("Note", NoteSchema);