require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const USER_MODEL = process.env.USER_MODEL;
const User = mongoose.model(USER_MODEL);

const _validateLoginData = (req) => {
    return new Promise((resolve, reject) => {
        if (req.body && req.body.username && req.body.password) {
            resolve(req.body)
        } else {
            reject()
        }
    })
}

const _getUserfromDb = (req) => {
    return User.findOne({ username: req.body.username }).exec()
}

const _generateToken = (req, user) => {
    return new Promise((resolve, reject) => {
        try {
            const token = jwt.sign(req.body, process.env.JWT_SECRET)
            resolve({ token: token, user })
        } catch (error) {
            reject(error)
        }
    })
}

const _comparePassword = (req, user) => {
    return new Promise((resolve, reject) => {
        try {
            const isValid = bcrypt.compareSync(req.body.password, user.password)
            if (isValid) {
                resolve(user)
            } else {
                reject()
            }
        } catch (error) {
            reject()
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

const _sendErrorResponse = (res, response, error) => {
    response.status = process.env.ERROR_STATUS_CODE,
        response.data = error
    res.status(response.status).send(response.data)
}

const _verifyToken = (req) => {
    return new Promise((resolve, reject) => {
        if (req.headers["authorization"]) {
            const token = req.headers["authorization"].replace("Bearer ", "")
            try {
                const data = jwt.verify(token, process.env.JWT_SECRET)
                if (data) {
                    resolve()
                }
            } catch (error) {
                reject(error)
            }
        } else {
            reject(process.env.UNAUTHORIZED_MESSAGE)
        }
    })

}

function login(req, res) {
    const response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
    _getUserfromDb(req)
        .then(() => _validateLoginData(req))
        .then(() => _getUserfromDb(req))
        .then((user) => _comparePassword(req, user))
        .then((user) => _generateToken(req, user))
        .then((data) => _setSuccessResponse(response, data))
        .catch((error) => _setErrorResponse(response, error))
        .finally(() => _sendResponse(res, response))
}

function authenticate(req, res, next) {
    const response = { status: process.env.SUCCESS_STATUS_CODE, data: "" }
    return _verifyToken(req)
        .then(() => next())
        .catch((error) => _sendErrorResponse(res, response, error))
}

module.exports = {
    login,
    authenticate
}