const accountModel = require("../models/account.model");

async function createAccountController(req, res) {
    const user = req.user;


    const account = await accountModel.create({
        user: user._id
    })
    res.status(201).json({
        account
    })

}
//ek user ki id ke saath account create karo
//and response pe send krdo bus itna kaam hai

module.exports = {
    createAccountController
}

