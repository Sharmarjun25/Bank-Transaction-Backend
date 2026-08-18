
const express = require('express')
const { userRegisterController, userLoginController, userLogoutController } = require('../controlllers/auth.controller')
const router = express.Router()

router.post('/register', userRegisterController)



/**
 * POST/api/auth/login
 */


router.post('/login', userLoginController)

/**
 * POST/api/auth/logout
 */

router.post('/logout', userLogoutController)

module.exports = router

