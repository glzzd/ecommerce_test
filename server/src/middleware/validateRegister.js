function validateRegister(req, res, next){
    const {name, email, password} = req.body || {}
    
    const errors = []

    if(typeof name !=="string" || name.trim().length < 2){
        errors.push({
            field: "name",
            message: "Ad ən azı 2 hərfdən ibarət olmalıdır"
        })
    }

    if(typeof name === "string" && name.trim().length > 20){
        errors.push({
            field: "name",
            message: "Ad maksimum 20 hərfdən ibarət ola bilər"
        })
    }

    if(typeof email !=="string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){
        errors.push({
            field: "email",
            message: "E-poçt ünvanı düzgün deyil"
        })
    }

    if(typeof password !== "string" || password.length < 8 || password.length > 72){
        errors.push({
            field: "password",
            message: "Şifrə 8-72 simvol arasında olmalıdır"
        })
    }

    if(errors.length > 0){
        return res.status(400).json({
            success: false,
            message: "Daxil olunan məlumatlar düzgün deyil",
            errors
        })
    }

    next()

}

module.exports = validateRegister