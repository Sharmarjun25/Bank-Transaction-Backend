require("dotenv").config()


const app = require("./src/app")

const connectToDB = require("./src/config/db")

//require is used because in older methods companiny uses reqiure

connectToDB()
//call back the function 

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})