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

//get/api/accounts/balance/:accountID

router.get("/balance/:accountId", authMiddleware.authMiddleware, AccountController.getAccountBalanceController)

module.exports = router;