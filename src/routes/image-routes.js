const express = require("express");
const ImageController = require("../controllers/image-controller");

const router = express.Router();

router.post("/presign/put", ImageController.presignPut);
router.post("/presign/post", ImageController.presignPost);
router.get("/url", ImageController.getUrlFromKey);
router.post("/url-to-key", ImageController.urlToKey);
router.delete("/delete", ImageController.delete);

module.exports = router;
