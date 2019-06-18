'use strict';
const path = require('path');
const filePath = path.join(process.cwd(), '/includes', 'auth/users');

module.exports.execute = function(params) {
    const {action} = params;
    switch(action){
        case 'add_user': 
        return filePath;
            break;
        default:
            return 'no matching action!'    
    }
}
