const permissions = {
    customer:[
        "product:read",
        "cart:read",
        "cart:write",
        "order:create",
        "order:read:own",
        "order:cancel:own",
        "payment:create"
    ],
    manager:[
        "product:read",
        "product:create",
        "product:update",
        "product:delete",
        "cart:read",
        "order:create",
        "order:read:own",
        "order:read:all",
        "order:update:status",
        "dashboard:read"
    ],
    admin:[
        "product:read",
        "product:create",
        "product:update",
        "product:delete",

        "cart:read",

        "order:create",
        "order:read:own",
        "order:read:all",
        "order:update:status",
        "order:cancel:all",

        "payment:create",
        "payment:read",
        "payment:refund",

        "user:read",
        "user:update",
        "user:delete",
        "user:role:update",
        

        "dashboard:read",
        "audit:read"
    ],

}

function hasPermission(role, permission){
    return permissions[role]?.includes(permission) || false
}

module.exports = {
    permissions,
    hasPermission
}