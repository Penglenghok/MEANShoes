require("dotenv").config();
const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
    color: { type: String, required: true },
    price: { type: Number, required: true },
});

const shoeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    category: {
        type: String,
        required: true,
    },
    releaseYear: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    variants: {
        type: [variantSchema],
        sparse: true,
    },
    photoURL: String,
});



const SHOE_MODEL = process.env.SHOE_MODEL;
const SHOE_COLLECTION = process.env.SHOE_COLLECTION;

mongoose.model(SHOE_MODEL, shoeSchema, SHOE_COLLECTION);
