const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenBlacklistModel = require("../models/blacklist.model")


async function userRegisterController(req, res) {

    try {

        const { email, password, name } = req.body

        const isExists = await userModel.findOne({
            email: email
        })
        // 422 is used for The server understood the request,
        //  but the data is invalid or fails validation.
        if (isExists) {
            return res.status(422).json({
                message: "User already exists with email.",
                status: "failed"
            })
        }
        const user = await userModel.create({
            email, password, name
        })

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET,
            { expiresIn: "3d" }
        )

        res.cookie("token", token)

        res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })

        emailService.sendRegistrationEmail(user.email, user.name).catch(err => console.error("Registration email failed:", err))

    } catch (err) {
        res.status(500).json({ message: "Internal server error " })
    }



}


/**
 * User login controller
 */

async function userLoginController(req, res) {

    try {
        const { email, password } = req.body

        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(401).json({
                message: "Email or password is invalid"
            })
        }

        const isValidPassword = await user.comparePassword(password)

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Email or password is invalid"
            })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET,
            { expiresIn: "3d" }
        )

        res.cookie("token", token)

        res.status(200).json({
            //200 is used for login and 201 for creating a user 
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })


    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error "
        })
    }

}

async function userLogoutController(req, res) {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(400).json({
            message: "User logged out successfully"
        })
    }

    await tokenBlacklistModel.create({
        token: token
    })

    res.clearCookie("token")

    res.status(200).json({
        message: 'user logged out successfully'
    })
}


module.exports = {
    userRegisterController, userLoginController,
    userLogoutController
}