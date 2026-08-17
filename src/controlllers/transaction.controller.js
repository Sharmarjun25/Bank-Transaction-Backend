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
        return res.status(400).json({
            message: "FromAccount , toAccount , amount and idompotency key are required"

        })
    }

    try {

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
            return res.status(400).json({
                message: `Insufficient balance . Current balance is ${balance}.
            Requested amount is ${amount}`
            })
        }

        //create transaction
        const session = await mongoose.startSession()
        //startTransaction ke liye ya toh kuch bhi complete nhi hoga 
        //ya sab complete hoga 
        session.startTransaction()

        try {
            const [transaction] = await transactionModel.create([{
                fromAccount, toAccount, amount, idempotencyKey,
                status: "PENDING"
            }], { session })

            const debitLedgerEntry = await ledgerModel.create([{
                account: fromAccount,
                amount: amount,
                transaction: transaction._id,
                type: "DEBIT"


            }], { session })

            const creditLedgerEntry = await ledgerModel.create([{
                account: toAccount,
                amount: amount,
                transaction: transaction._id,
                type: "CREDIT"


            }], { session })

            transaction.status = "COMPLETED"
            await transaction.save({ session })

            await session.commitTransaction()

            res.status(201).json({
                message: "Transaction completed successfully",
                transaction: transaction
            })
            //send email notification now (after response — so email failure doesn't crash the API)
            emailService.sendtransactionEmail(req.user.email, req.user.name, amount, toAccount)
                .catch(err => console.error("Email failed:", err));


        } catch (err) {
            await session.abortTransaction()
            console.error(err)
            res.status(500).json({
                message: "transaction failed", error: err.message
            })
        } finally {

            session.endSession()

        }

    } catch (err) { //this catches casterror from invalid objectid
        console.error(err)
        res.status(400).json({
            message: "Invalid account ID format", error: err.message
        })
    }

}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount , amount and idempotencykey are required"
        })
    }

    try {

        const toUserAccount = await accountModel.findOne({
            _id: toAccount,
        })
        if (!toUserAccount) {
            return res.status(400).json({
                message: "invalid toAccount"
            })
        }
        const fromUserAccount = await accountModel.findOne({
            user: req.user._id
        })

        if (!fromUserAccount) {
            return res.status(400).json({
                message: "System user account not found"
            })
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        try {

            const transaction = new transactionModel({
                fromAccount: fromUserAccount._id,
                toAccount,
                amount,
                idempotencyKey,
                status: "PENDING"

            })
            //data will go in the form of an array of objects 
            const debitLedgerEntry = await ledgerModel.create([{
                account: fromUserAccount._id,
                amount: amount,
                transaction: transaction._id,
                type: "DEBIT"
            }], { session })

            /*await (() => {
                return new Promise((resolve) => setTimeout(resolve, 100 * 1000))
        
            })()*/

            const creditLedgerEntry = await ledgerModel.create([{
                account: toAccount,
                amount: amount,
                transaction: transaction._id,
                type: "CREDIT"
            }], { session })

            transaction.status = "COMPLETED"
            await transaction.save({ session })

            await session.commitTransaction()

            //await emailService.sendtransactionEmail(req.user.email , req)

            return res.status(201).json({
                message: "Initial funds transaction completed successfully",
                transaction: transaction
            })

        } catch (err) {
            await session.abortTransaction()
            console.error(err)
            res.status(500).json({
                message: "Transaction failed", error: err.message
            })
        } finally {
            session.endSession()


        }

    } catch (err) {
        console.error(err)
        res.status(400).json({
            message: "Invalid account ID format", error: err.message
        })
    }
}


module.exports = {
    createTransaction, createInitialFundsTransaction
}
