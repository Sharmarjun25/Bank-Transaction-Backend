const express = require('express') // creating
const authRoutes = require('./routes/auth.routes')

//creating server instance 
const app = express()

// Middleware to parse JSON bodies
app.use(express.json())

// Mount the auth routes
app.use('/api/auth', authRoutes)

module.exports = app