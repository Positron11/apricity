var express = require("express");
var router = express.Router();

const authMiddleware = require("../middleware/auth_middleware")
const blogController = require("../controllers/notes");
const commentController = require("../controllers/comment")

router.get("/", blogController.index);

router.get("/create", authMiddleware.sessionAuthCheck("superuser"), blogController.create_get);
router.post("/create", authMiddleware.sessionAuthCheck("superuser"), blogController.create_post);

router.get("/:slug/edit", authMiddleware.sessionAuthCheck("superuser"), blogController.edit_get);
router.post("/:slug/edit", authMiddleware.sessionAuthCheck("superuser"), blogController.edit_post);

router.get("/:slug/delete", authMiddleware.sessionAuthCheck("superuser"), blogController.delete_get);
router.post("/:slug/delete", authMiddleware.sessionAuthCheck("superuser"), blogController.delete_post);

router.get("/:slug", blogController.detail);

router.post("/:slug/comment/create", authMiddleware.sessionAuthCheck(), commentController.comment_create);
router.post("/:slug/comment/:id/delete", authMiddleware.sessionAuthCheck(), commentController.comment_delete);
router.post("/:slug/comment/:id/edit", authMiddleware.sessionAuthCheck(), commentController.comment_edit);

module.exports = router;
