function authorize(...allowedRoles) {
    return function (req, res, next) {
        if(!req.user){
            return res.status(401).json({
                success: false,
                message: "Autentifikasiya tələb olunur"
            })
        }

        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message: "Bu əməliyyat üçün icazəniz yoxdur"
            })
        }

        next()
    }
}

module.exports = authorize