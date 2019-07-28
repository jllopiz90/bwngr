'use strict';
import ManagersDAO from '../dao/managersDAO';
import UserAuth from '../auth/users';


module.exports.execute = async function (params) {
    const { action, token = '' } = params;
    console.log('action:',action)
    switch (action) {
        case 'getManagers':
            if(await UserAuth.verify(token)){
                const result = await ManagersDAO.getManager();
                return {success: !!result, message: result || 'An problem has happened getting managers.'}
            }
            return {success: false, message: 'Auth failed'}
        default:
            return 'no matching action!'
    }
}
