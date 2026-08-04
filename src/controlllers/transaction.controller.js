const transactionModel = require("../models/transaction.model")

const ledgerModel = require("../models/ledger.model")

const accountModel = require("../models/account.model")


const emailService = require("../services/email.service");
const mongoose = require("mongoose")

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
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyexists
            })
        }

        if (isTransactionAlreadyexists.status === "PENDING") {
            return res.status(200).json({
                message: "transaction is still processing",
                transaction: isTransactionAlreadyexists
            })
        }

        if (isTransactionAlreadyexists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction processing failed , please retry"
            })
        }

        if (isTransactionAlreadyexists.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed , please retry"
            })
        }


    }

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both Account must be active to process transaction"

        })
    }

    //derive sender balance from ledger
    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        res.status(400).json({
            message: `Insufficient balance . Current balance is ${balance}.
            Requested amount is ${amount}`
        })
    }

    //create transaction
    const session = await mongoose.startSession()
    //startTransaction ke liye ya toh kuch bhi complete nhi hoga 
    //ya sab complete hoga 
    session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount, toAccount, amount, idempotencyKey,
        status: "PENDING"
    }, { session })

    const debitLedgerEntry = await ledgerModel.create({
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"


    }, { session })

    const creditLedgerEntry = await ledgerModel.create({
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"


    }, { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })


    await session.commitTransaction()
    session.endSession()


    //send email notification now
    await emailService.sendtransactionEmail(req.user.email, req.user.name, amount, toAccount);
    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })





}

module.exports = {
    createTransaction
}
