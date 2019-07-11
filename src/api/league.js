'use strict';
import GetLeageData  from '../requests/getLeagueData';
import UserAuth from '../auth/users';


module.exports.execute = async function (params) {
    const { action, token = '' } = params;
    console.log('action:',action)
    switch (action) {
        case 'getManagers':
            if(await UserAuth.verify(token)){
                const handleLeage = new GetLeageData();
                const result = await handleLeage.getManagers();
                return {success: result.success, message: result.message}
            }
            return {success: false, message: 'Auth failed'}
        default:
            return 'no matching action!'
    }
}