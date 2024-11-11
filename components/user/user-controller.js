require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const USER_MODEL = process.env.USER_MODEL;
const User = mongoose.model(USER_MODEL);

const _getUserPostData = (req) => {
    return new Promise((resolve, reject) => {
        if (req.body && req.body.name && req.body.username && req.body.password) {
            resolve(req.body)
        } else {
            reject(process.env.MISSING_REQUIRED_DATA_MESSAGE)
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

const _insertUser = (userData) => {
    const user = new User(userData)
    return user.save()
}

const _generatSalt = () => {
    return new Promise((resolve, reject) => {
        try {
            const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUND))
            resolve(salt)
        } catch (error) {
            reject(error)
        }
    })
}

const _hashPassword = (reqBody, salt) => {
    return new Promise((resolve, reject) => {
        try {
            const password = reqBody.password
            const hashedPassword = bcrypt.hashSync(password, salt)
            const userData = reqBody
            userData.password = hashedPassword
            resolve(userData)
        } catch (error) {
            reject(error)
        }
    })
}


function createUser(req, res) {
    const response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
    _getUserPostData(req)
        .then(() => _generatSalt())
        .then((salt) => _hashPassword(req.body, salt))
        .then((userData) => _insertUser(userData))
        .then((data) => _setSuccessResponse(response, data))
        .catch((error) => _setErrorResponse(response, error))
        .finally(() => _sendResponse(res, response))
}


module.exports = { createUser }