const AppError = require("../utils/AppError");

function adminOnly(req, res, next){
    if(!req.user){
        return next(new AppError("Giriş tələb olunur", 401))
    }

    if(req.user.role !=="admin"){
        return next(new AppError("Bu əməliyyatı yerinə yetirmək üçün administarator icazəsi lazımdır", 403))
    }

next()
}

module.exports = adminOnly