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

// Health check route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Backend Ledger API is running",
        //version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            accounts: "/api/accounts",
            transactions: "/api/transactions"
        }
    })
})

// Mount the auth routes
app.use('/api/auth', authRoutes)
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transactionRoutes)

module.exports = app
