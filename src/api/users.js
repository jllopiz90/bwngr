'use strict';
import UserAuth from '../auth/users';


module.exports.execute = async function (params) {
    const { action, user = '', pswd = '', isAdmin = false, token = '' } = params;
    console.log(action)
    switch (action) {
        case 'add_user':
            return await UserAuth.registerUser(user, pswd, isAdmin);
        case 'login':
            return await UserAuth.loginUser(user, pswd);
        default:
            return 'no matching action!'
    }
}
