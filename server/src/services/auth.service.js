const User = require("../models/User.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

async function loginUser({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
        email: normalizedEmail
    }).select("+password");

    if (!user) {
        const error = new Error("E-poçt və ya şifrə yanlışdır");
        error.statusCode = 401;
        throw error;
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        const error = new Error("E-poçt və ya şifrə yanlışdır");
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        },
        token
    };
}

async function registerUser({name, email, password}) {
    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await User.findOne({email: normalizedEmail})

    if(existingUser){
        const error = new Error("Bu e-poçt ünvanı artıq istifadə olunur")
        error.statusCode = 409 // Conflict code
        throw error
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    try {
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        })
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }
    } catch (error) {
        if(error.code === 11000){
            const duplicateError = new Error("Bu e-poçt ünvanı artıq istifadə olunur")
            duplicateError.statusCode = 409
            throw duplicateError
        }

        throw error
    }

}

module.exports = {
    registerUser,
    loginUser
}