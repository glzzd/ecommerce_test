const AppError = require("../utils/AppError");

function notFound(req, res, next) {
    next(
        new AppError(`Marşrut tapılmadı: ${req.method} ${req.originalUrl}`, 404)
    )

}

module.exports = notFound

