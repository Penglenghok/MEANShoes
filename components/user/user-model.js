require("dotenv").config();
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

const USER_MODEL = process.env.USER_MODEL;
const USER_COLLECTION = process.env.USER_COLLECTION;

mongoose.model(USER_MODEL, userSchema, USER_COLLECTION);
