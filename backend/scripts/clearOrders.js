// backend/scripts/clearOrders.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Order = require("../models/Order");

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    await Order.deleteMany({});
    console.log("All orders deleted");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error(err);
    mongoose.disconnect();
  });
