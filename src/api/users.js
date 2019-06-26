'use strict';
import User from '../api/auth/users';


module.exports.execute = async function(params, callback) {
    const {action, user = '', pswd = '', token = ''} = params;
    switch(action){
        case 'add_user': 
            const user =  new User();
            user.registerUser(user,pswd, callback);
            break;
        default:
            return 'no matching action!'    
    }
}
