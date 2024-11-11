require("dotenv").config();
const mongoose = require("mongoose");

const SHOE_MODEL = process.env.SHOE_MODEL;
const Shoes = mongoose.model(SHOE_MODEL);

const _getAllShoesQueryStrings = (req) => {
  return new Promise((resolve) => {
    const page_number = req.query.page_number
      ? parseInt(req.query.page_number) - 1
      : 0;
    const page_size = req.query.page_size ? parseInt(req.query.page_size) : process.env.DEFAULT_PAGE_SIZE;
    const skipCount = page_number * page_size;
    resolve({ page_size, skipCount })
  })
}

const _getShoesId = (req) => {
  return new Promise((resolve, reject) => {
    const id = req.params.id
    if (mongoose.isValidObjectId(id)) {
      resolve(id)
    } else {
      reject(process.env.INVALID_ID_MESSAGE)
    }
  })
}

const _getShoesIdAndVariantId = (req) => {
  return new Promise((resolve, reject) => {
    const shoesId = req.params.shoesId;
    const variantId = req.params.variantId;
    if (mongoose.isValidObjectId(shoesId) && mongoose.isValidObjectId(variantId)) {
      resolve({ shoesId, variantId })
    } else {
      reject(process.env.INVALID_ID_MESSAGE)
    }
  })
}

const _setSuccessResponse = (response, data) => {
  response.data = data
}

const _setErrorResponse = (response, error) => {
  response.status = process.env.ERROR_STATUS_CODE,
    response.data = error
}

const _sendResponse = (res, response) => {
  res.status(response.status).send(response.data)
}

const _getShoesPostData = (req) => {
  return new Promise((resolve, reject) => {
    if (req.body && req.body.name && req.body.category && req.body.releaseYear && req.body.brand) {
      resolve(req.body)
    } else {
      reject(process.env.MISSING_REQUIRED_DATA_MESSAGE)
    }
  })
}

const _getShoesIdAndPostData = (req) => {
  return new Promise((resolve, reject) => {
    const id = req.params.id
    if (mongoose.isValidObjectId(id)) {
      if (req.body && req.body.name && req.body.category && req.body.releaseYear && req.body.brand) {
        resolve({ shoesId: id, shoesData: req.body })
      } else {
        reject(process.env.MISSING_REQUIRED_DATA_MESSAGE)
      }
    } else {
      reject(process.env.INVALID_ID_MESSAGE)
    }

  })
}

const _insertShoes = (shoesData) => {
  const shoes = new Shoes(shoesData);
  return shoes.save();
}

const _getShoesIdAndVariantBody = (req) => {
  return new Promise((resolve, reject) => {
    const id = req.params.id
    if (mongoose.isValidObjectId(id)) {
      if (req.body && req.body.color && req.body.price) {
        resolve({ shoesId: id, variantData: req.body })
      } else {
        reject(process.env.MISSING_REQUIRED_DATA_MESSAGE)
      }
    } else {
      reject(process.env.INVALID_ID_MESSAGE)
    }
  })
}

const _preparePartialUpdateData = (req) => {
  return new Promise((resolve) => {
    const shoesId = req.params.shoesId;
    const variantId = req.params.variantId;
    const updateData = {};
    if (variant.color) {
      updateData["variants.$.color"] = variant.color;
    }
    if (variant.price) {
      updateData["variants.$.price"] = variant.price;
    }
    updateData["variants.$._id"] = variantId;
    resolve({ shoesId, variantId, updateData })
  })
}

const _prepareFullUpdateData = (req) => {
  return new Promise((resolve) => {
    const shoesId = req.params.shoesId;
    const variantId = req.params.variantId;
    const updateData = req.body;
    resolve({ shoesId, variantId, updateData })
  })
}

function createShoes(req, res) {
  let response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
  _getShoesPostData(req)
    .then((shoesData) => _insertShoes(shoesData))
    .then((data) => _setSuccessResponse(response, data))
    .catch((error) => _setErrorResponse(response, error))
    .finally(() => _sendResponse(res, response))
}

function fullUpdateShoes(req, res) {
  let response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
  _getShoesIdAndPostData(req)
    .then(({ shoesId, shoesData }) => {
      return Shoes.replaceOne({ _id: shoesId }, shoesData, {
        runValidators: true,
        upsert: false,
      }).exec()
    })
    .then((data) => _setSuccessResponse(response, data))
    .catch((error) => _setErrorResponse(response, error))
    .finally(() => _sendResponse(res, response))
}

function partialUpdateShoes(req, res) {
  let response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
  _getShoesId(req)
    .then((shoesId) => Shoes.updateOne({ _id: shoesId }, req.body))
    .then((data) => _setSuccessResponse(response, data))
    .catch((error) => _setErrorResponse(response, error))
    .finally(() => _sendResponse(res, response))
}

function getAllShoes(req, res) {
  let response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
  _getAllShoesQueryStrings(req)
    .then(({ page_size, skipCount }) => Shoes.find().skip(skipCount).limit(page_size).exec())
    .then((shoes) => _setSuccessResponse(response, shoes))
    .catch((error) => _setErrorResponse(response, error))
    .finally(() => _sendResponse(res, response))
}

function getOneShoes(req, res) {
  let response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
  _getShoesId(req)
    .then((shoeId) => Shoes.findById(shoeId).exec())
    .then((shoes) => _setSuccessResponse(response, shoes))
    .catch((error) => _setErrorResponse(response, error))
    .finally(() => _sendResponse(res, response))
}

function deleteOneShoes(req, res) {
  let response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
  _getShoesId(req)
    .then((shoesId) => Shoes.findByIdAndDelete(shoesId).exec())
    .then((data) => _setSuccessResponse(response, data))
    .catch((error) => _setErrorResponse(response, error))
    .finally(() => _sendResponse(res, response))
}

function createShoesVariant(req, res) {
  let response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
  _getShoesIdAndVariantBody(req)
    .then(({ shoesId, variantData }) =>
      Shoes.findByIdAndUpdate(
        shoesId,
        {
          $push: {
            variants: variantData,
          },
        },
        {
          runValidators: true,
        }
      )
    )
    .then((data) => _setSuccessResponse(response, data))
    .catch((error) => _setErrorResponse(response, error))
    .finally(() => _sendResponse(res, response))
}

function partialUpdateShoesVariant(req, res) {
  let response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
  _getShoesIdAndVariantId(req)
    .then(() => _preparePartialUpdateData(req))
    .then(({ shoesId, variantId, updateData }) => Shoes.findOneAndUpdate(
      { _id: shoesId, "variants._id": variantId },
      updateData
    ))
    .then((data) => _setSuccessResponse(response, data))
    .catch((error) => _setErrorResponse(response, error))
    .finally(() => _sendResponse(res, response))
}

function fullUpdateShoesVariant(req, res) {
  let response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
  _getShoesIdAndVariantId(req)
    .then(() => _prepareFullUpdateData(req))
    .then(({ shoesId, variantId, updateData }) => Shoes.findOneAndUpdate(
      { _id: shoesId, "variants._id": variantId },
      updateData,
      {
        runValidators: true
      }
    ))
    .then((data) => _setSuccessResponse(response, data))
    .catch((error) => _setErrorResponse(response, error))
    .finally(() => _sendResponse(res, response))
}

function deleteShoeVariant(req, res) {
  let response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
  _getShoesIdAndVariantId(req)
    .then(() => Shoes.findOneAndUpdate(
      { _id: shoeId },
      { $pull: { variants: { _id: variantId } } }
    ))
    .then((data) => _setSuccessResponse(response, data))
    .catch((error) => _setErrorResponse(response, error))
    .finally(() => _sendResponse(res, response))
}

function getShoesVariants(req, res) {
  let response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
  _getShoesId(req)
    .then((shoesId) => Shoes.findOne({ _id: shoesId }).select("variants").exec())
    .then((data) => _setSuccessResponse(response, data))
    .catch((error) => _setErrorResponse(response, error))
    .finally(() => _sendResponse(res, response))
}

function getOneShoesVariants(req, res) {
  let response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
  _getShoesIdAndVariantId(req)
    .then(({ shoesId, variantId }) => Shoes.findOne(
      { _id: shoeId, "variants._id": variantId },
      { "variants.$": 1 }
    ).exec())
    .then((data) => _setSuccessResponse(response, data))
    .catch((error) => _setErrorResponse(response, error))
    .finally(() => _sendResponse(res, response))
}

module.exports = {
  createShoes,
  fullUpdateShoes,
  partialUpdateShoes,
  getAllShoes,
  getOneShoes,
  deleteOneShoes,
  createShoesVariant,
  partialUpdateShoesVariant,
  fullUpdateShoesVariant,
  deleteShoeVariant,
  getShoesVariants,
  getOneShoesVariants,
};
