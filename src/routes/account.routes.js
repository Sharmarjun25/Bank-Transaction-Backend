const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const AccountController = require("../controlllers/account.controller")





const router = express.Router();
/**
 * -Create a new account
 * -Protected route
 */

router.post("/", authMiddleware.authMiddleware, AccountController.createAccountController)


router.get("/", authMiddleware.authMiddleware, AccountController.getUserAccountsController)

module.exports = router;