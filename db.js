const mongoose = require("mongoose")

let uri = "mongodb://localhost:27017/Secrets"

const connectToDB  = ()=>mongoose.connect(uri)

module.exports = connectToDB