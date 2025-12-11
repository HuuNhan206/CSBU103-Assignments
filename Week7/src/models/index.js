// const UserModel = require('./user.local') // Use db.json
const UserModel = require('./user.mongo') // Use MongoDB
module.exports = {
    UserModel
}