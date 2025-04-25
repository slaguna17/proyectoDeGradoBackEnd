const ImageService = require('../services/image-service');
const ProductService = require('../services/product-service');

const ImageController = {
  getPresignedUrl: async (req, res, next) => {
    const { contentType, entityType = 'general' } = req.body; // Obtener de body o query

    if (!contentType) {
      return res.status(400).json({ message: "contentType es requerido." });
    }

    // Validación básica de tipos permitidos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      return res.status(400).json({ message: `Tipo de archivo no permitido: ${contentType}` });
    }

    try {
      const { signedUrl, publicUrl, key } = await ImageService.generatePresignedPutUrl(contentType, entityType);

      res.status(200).json({
        uploadUrl: signedUrl,
        accessUrl: publicUrl,
        imageKey: key // Devuelve la clave por si la necesitas (ej: para borrar si falla confirmación)
      });

    } catch (error) {
      console.error("Error en controller getPresignedUrl:", error.message);
      next(error); // Pasa al manejador de errores global
    }
  },

  confirmImageUpload: async (req, res, next) => {
    const { entityId, entityType, imageUrl, imageKey } = req.body;

    if (!entityId || !entityType || !imageUrl) {
      return res.status(400).json({ message: "Faltan datos requeridos: entityId, entityType, imageUrl." });
    }

    try {
      let updateSuccessful = false;

      switch (String(entityType).toLowerCase()) {
        case 'user':
          console.log(`Placeholder: Actualizando avatar para user ${entityId} con URL: ${imageUrl}`);
          // await UserService.updateUserAvatar(entityId, imageUrl);
          updateSuccessful = true;
          break;
        case 'product':
          console.log(`Placeholder: Actualizando imagen para product ${entityId} con URL: ${imageUrl}`);
          // await ProductService.updateProductImage(entityId, imageUrl);
          updateSuccessful = true;
          break;
        case 'category':
          console.log(`Placeholder: Actualizando imagen para category ${entityId} con URL: ${imageUrl}`);
          // await CategoryService.updateCategoryImage(entityId, imageUrl);
          updateSuccessful = true;
          break;
        case 'store':
          console.log(`Placeholder: Actualizando logo para store ${entityId} con URL: ${imageUrl}`);
          // await StoreService.updateStoreLogo(entityId, imageUrl);
          updateSuccessful = true;
          break;
        default:
          return res.status(400).json({ message: `Tipo de entidad no válido: ${entityType}` });
      }

      if (!updateSuccessful) {
        if (imageKey) {
          console.warn(`Fallo BD; eliminando imagen huérfana: ${imageKey}`);
          await ImageService.deleteImageFromS3(imageKey);
        }
        return res.status(404).json({ message: `No se encontró la entidad ${entityType} con ID ${entityId}.` });
      }

      console.log(`Imagen confirmada y URL guardada para ${entityType} ${entityId}`);
      res.status(200).json({ message: "URL de imagen guardada correctamente.", accessUrl: imageUrl });

    } catch (error) {
      console.error(`Error en controller confirmImageUpload para ${entityType} ${entityId}:`, error.message);
      if (imageKey) {
        console.warn(`Error BD; intentando eliminar imagen huérfana: ${imageKey}`);
        ImageService.deleteImageFromS3(imageKey).catch(err => console.error("Error S3:", err.message));
      }
      next(error);
    }
  },
};

module.exports = ImageController;
