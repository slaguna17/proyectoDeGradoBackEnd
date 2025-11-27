const express = require('express');
const rateLimit = require('express-rate-limit');
const ImageController = require('../controllers/image-controller');

const router = express.Router();

// Rate-limit
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 req/min per IP
});
router.use(limiter);

// Presign directly to final path (entity/id/kind)
router.post('/presign/entity-put', ImageController.presignEntityPutOpen);

// Generic Presign with folder + fileName (restricted to selected roots)
router.post('/presign/put', ImageController.presignPutOpen);

// Resolve reading URL for key (signed or open) 
router.get('/url', ImageController.getUrlFromKey);

// Convert URL to key
router.post('/url-to-key', ImageController.urlToKey);

// Delete by key
router.delete('/', ImageController.delete);

module.exports = router;
