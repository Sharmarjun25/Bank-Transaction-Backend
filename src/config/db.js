const mongoose = require("mongoose")




function connectToDB() {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {

            console.log("Server is connected to DB ")

        })
        .catch(err => {
            console.log("Error connecting to DB:", err.message)
            process.exit(1)
            //this means that if server is not connected to the database 
            //then exit from the server
        })

    //})
}

module.exports = connectToDB

