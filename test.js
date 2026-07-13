const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/test")
  .then(() => {
    console.log("MongoDB Connected Successfully");
    process.exit();
  })
  .catch(err => console.error(err));