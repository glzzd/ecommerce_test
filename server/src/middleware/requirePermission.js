const { hasPermission } = require("../config/permissions")
const AppError = require("../utils/AppError")


function requirePermission(permisson){
    return function (req, res, next){
        if(!req.user){
            return next (
                new AppError("Giris teleb olunur", 401)
            )
        }

        const allowed = hasPermission(req.user.role, permisson)

        if(!allowed){
            return next(
                new AppError("Bu emeliyyat ucun icazeniz yoxdur", 403)
            )
        }

        next();
    }
}

module.exports = requirePermission