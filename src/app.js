const express = require('express') // creating
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth.routes')
const accountRouter = require("./routes/account.routes")
const transactionRoutes = require("./routes/transaction.routes")

//creating server instance 
const app = express()

// Middleware to parse JSON bodies
app.use(express.json())

// Middleware to parse cookies
app.use(cookieParser())

// Mount the auth routes
app.use('/api/auth', authRoutes)
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transactionRoutes)

module.exports = app
