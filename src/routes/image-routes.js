const express = require('express');
const router = express.Router();
const imageController = require( '../controllers/image-controller.js');
// import { authenticateToken } from '../middleware/auth-middleware.js'; // Descomenta si usas autenticación

// POST /api/images/presigned-url
// Body esperado: { "contentType": "image/jpeg", "entityType": "product" } (entityType es opcional)
router.post(
    '/presigned-url',
    // authenticateToken, // <-- Agrega tu middleware de autenticación aquí si es necesario
    imageController.getPresignedUrl
);

// POST /api/images/confirm-upload
// Body esperado: { "entityId": 123, "entityType": "user", "imageUrl": "https://...", "imageKey": "avatars/uuid.jpg" }
router.post(
    '/confirm-upload',
     // authenticateToken, // <-- Agrega tu middleware de autenticación aquí si es necesario
    imageController.confirmImageUpload
);

module.exports = router;