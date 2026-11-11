const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/adminUser.service")

const getUsers = asyncHandler(async (req, res) => {
    const result = await userService.getUsers(req.query)

    res.status(200).json({
        success: true,
        data: result
    })
})

const updateUserRole = asyncHandler(async (req, res)=>{
    const user = await userService.updateUserRole(req.params.id, req.body.role, req.user._id)

    res.status(200).json({
        success: true,
        message: "Istifadeci rolu yenilendi",
        data: {user}
    })
})

const setUserActiveStatus = asyncHandler(async (req, res)=> {
    const user = await userService.setUserActiveStatus(
        req.params.id, req.body.isActive, req.user._id
    )
   res.status(200).json({
        success: true,
        message: "Istifadeci statusu yenilendi",
        data: {user}
    })

})

module.exports = {
    getUsers,
    setUserActiveStatus,
    updateUserRole
}