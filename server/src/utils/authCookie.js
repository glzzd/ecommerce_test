const config = require("../config/env");



function getRefreshCookieOptions(){
    return {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "lax",
        path: "/api/auth",
        maxAge: config.refreshTokenExpiresDays*24*60*60*1000
    }
}

module.exports = {
    getRefreshCookieOptions
}