const express = require("express");
const controller = require("./shoe-controller");
const authController = require("./../auth/auth-controller")
const router = express.Router();

router.route("/")
    .post(controller.createShoes)
    .get(controller.getAllShoes);

router.route("/:id")
    .post(authController.authenticate, controller.createShoesVariant)
    .put(authController.authenticate, controller.fullUpdateShoes)
    .patch(authController.authenticate, controller.partialUpdateShoes)
    .get(authController.authenticate, controller.getOneShoes)
    .delete(authController.authenticate, controller.deleteOneShoes)

router.route("/:shoesId/variant/:variantId")
    .patch(authController.authenticate, controller.partialUpdateShoesVariant)
    .put(authController.authenticate, controller.fullUpdateShoesVariant)
    .delete(authController.authenticate, controller.deleteShoeVariant)
    .get(authController.authenticate, controller.getOneShoesVariants)



module.exports = router;
