const transactionModel = require("../models/transaction.model")

const ledgerModel = require("../models/ledger.model")

const accountModel = require("../models/account.model")


const emailService = require("../services/email.service");

async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        //400 is send when there is a mistake from a client side and server 
        //cannot process it 
        res.status(400).json({
            message: "FromAccount , toAccount , amount and idompotency key are required"

        })
    }
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })
    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }

    //validating idompotency key

    const isTransactionAlreadyexists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyexists) {
        if (isTransactionAlreadyexists.status === "COMPLETED") {
            res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyexists
            })
        }
    }
}

