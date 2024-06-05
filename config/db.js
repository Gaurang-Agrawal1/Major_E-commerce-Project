const mongoose = require("mongoose");
require("dotenv").config();// jp b env k andr define hoga wo process object m load ho jayega
const dbConnect = () => {
    mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("DB ka connection is successful"))
    .catch( (error) => {
        console.log("Issue in DB Connection");
        console.error(error.message);
        process.exit(1);
    });
    

}
module.exports = dbConnect;