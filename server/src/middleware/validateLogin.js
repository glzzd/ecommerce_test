function validateLogin(req, res, next) {
    const { email, password } = req.body || {};

    const errors = []

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
     errors.push({
        field: "email",
        message: "Düzgün e-poçt ünvanı daxil edin"
     })
    }

    if (typeof password !== "string" || password.length === 0 ||  password.length > 72) {
      errors.push({
        field: "password",
        message: "Şifrə daxil edilməlidir"
     })
    }

    if(errors.length > 0){
        return res.status(400).json({
            success: false,
            message: "Göndərilən məlumatlar düzgün deyil",
            errors
        })
    }

    next();
}

module.exports = validateLogin;