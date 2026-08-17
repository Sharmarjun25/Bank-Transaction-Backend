const accountModel = require("../models/account.model");

async function createAccountController(req, res) {

    try {

        const user = req.user;


        const account = await accountModel.create({
            user: user._id
        })
        res.status(201).json({
            account
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: "Internal server error"
        })
    }


}
//ek user ki id ke saath account create karo
//and response pe send krdo bus itna kaam hai

async function getUserAccountsController(req, res) {

    try {

        const accounts = await accountModel.find({ user: req.user._id });

        res.status(200).json({
            accounts
        })

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }


}

async function getAccountBalanceController(req, res) {

    try {

        const { accountId } = req.params;

        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id
        })

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            })
        }

        const balance = await account.getBalance(); // balance X Balance V
        res.status(200).json({
            accountId: account._id,
            balance: balance
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: "Internal server error"
        })
    }



}

module.exports = {
    createAccountController, getUserAccountsController,
    getAccountBalanceController
}

