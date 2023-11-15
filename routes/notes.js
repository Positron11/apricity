var express = require("express");
var router = express.Router();

const authMiddleware = require("../middleware/auth_middleware")
const blogController = require("../controllers/notes");

router.get("/", blogController.index);

router.get("/create", authMiddleware.sessionAuthCheck("superuser"), blogController.create_get);
router.post("/create", authMiddleware.sessionAuthCheck("superuser"), blogController.create_post);

router.get("/:slug/edit", authMiddleware.sessionAuthCheck("superuser"), blogController.edit_get);
router.post("/:slug/edit", authMiddleware.sessionAuthCheck("superuser"), blogController.edit_post);

router.get("/:slug/delete", authMiddleware.sessionAuthCheck("superuser"), blogController.delete_get);
router.post("/:slug/delete", authMiddleware.sessionAuthCheck("superuser"), blogController.delete_post);

router.get("/:slug", blogController.detail);

module.exports = router;
