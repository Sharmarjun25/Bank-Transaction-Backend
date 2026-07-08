
const express = require('express')
const { userRegisterController, userLoginController } = require('../controlllers/auth.controller')
const router = express.Router()

router.post('/register', userRegisterController)

// TODO: import and wire up your auth controller methods here
// const { register, login } = require('../controlllers/auth.controller')

// router.post('/register', register)
// router.post('/login', login)

/**
 * POST/api/auth/login
 */


router.post('/login', userLoginController)

module.exports = router

