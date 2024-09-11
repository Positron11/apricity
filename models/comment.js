const mongoose = require("mongoose");
const MarkdownIt = require("markdown-it");
const katex = require("@traptitech/markdown-it-katex");
const he = require("he");


const Schema = mongoose.Schema;

const md = new MarkdownIt();
md.use(katex);

const CommentSchema = new Schema({
	author: { type: Schema.Types.ObjectId, ref: "User", autopopulate: { select: "username" } },
	note: { type: Schema.Types.ObjectId, ref: "Note" },
	parent: { type: Schema.Types.ObjectId, ref: "Comment", index: true },
	content: { type: String, required: true },
}, { 
	timestamps: { createdAt: "posted", updatedAt: "edited" } 
});

CommentSchema.virtual("replies", {
	ref: "Comment",
	localField: "_id",
	foreignField: "parent",
	autopopulate: { options: { sort: { posted: -1 } } }
})

CommentSchema.plugin(require("mongoose-autopopulate"))

CommentSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
	for (const reply of this.replies) {
		await reply.deleteOne();
	}; next();
});

CommentSchema.methods.renderContent = function() {
	return md.render(he.decode(this.content));
}

module.exports = mongoose.model("Comment", CommentSchema);