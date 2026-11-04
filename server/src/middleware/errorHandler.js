function errorHandler(err, req, res, next){
    let statusCode = err.statusCode || 500
    let message = err.message || "Server xətası baş verdi"

    // Mongoose melumat yoxlamasi xetasi
  if (err.name === "ValidationError") {
    return res.status(400).json({
        success: false,
        message: "Göndərilən məlumatlar düzgün deyil!",
        errors: Object.values(err.errors).map(error => ({
            field: error.path,
            message: error.message,
            value: error.value
        }))
    });
}


    // Mongoose yanlis ObjectId xetasi
    if(err.name === "CastError"){
        statusCode = 400
        message = "Daxil edilən identifikator düzgün deyil"
    }


    // Mongoose unique index xetasi
    if(err.code === 11000){
        statusCode = 409
        message = "Bu məlumat artıq mövcuddur"
    }


    // Daxili xetalar
    if(statusCode >= 500){
        console.error("Server xətası baş verdi")
    }

    return res.status(statusCode).json({
        success:false,
        message
    })

}

module.exports = errorHandler