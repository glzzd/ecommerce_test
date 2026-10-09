const { registerUser } = require("../services/auth.service");

async function login(req, res){

}

async function register(req, res){
    try {
        const user = await registerUser(req.body)

        return res.status(201).json({
            success: true,
            message: "Uğurla qeydiyyatdan keçdiniz",
            data: {user}
        })
    } catch (error) {
        const statusCode = error.statusCode || 500

        if(statusCode === 500){
            console.error("Register xətası: ", error.message)
        }

        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? "Server xətası baş verdi" : error.message
        })
    }
}

module.exports = {
    register,
    login
}