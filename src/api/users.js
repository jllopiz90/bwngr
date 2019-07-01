'use strict';
import UserAuth from '../auth/users';


module.exports.execute = async function(params) {
    const {action, user = '', pswd = '', isAdmin = false, token = ''} = params;
    switch(action){
        case 'add_user': 
            return await UserAuth.registerUser(user,pswd, isAdmin);
        default:
            return 'no matching action!'    
    }
}
