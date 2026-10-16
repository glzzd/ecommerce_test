function validateLogin(req, res, next) {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
            success: false,
            message: "E-poçt ünvanını daxil edin"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
            success: false,
            message: "Düzgün e-poçt ünvanı daxil edin"
        });
    }

    if (typeof password !== "string" || password.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Şifrəni daxil edin"
        });
    }

    req.body.email = normalizedEmail;

    next();
}

module.exports = validateLogin;