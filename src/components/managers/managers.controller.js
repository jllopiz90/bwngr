import ManagersDAO from './managersDAO';


export default class ManagerController {
    static async getAllManagers(req, res, next) {
        try {
            const message = await ManagersDAO.getManager({}, {projection: {_id:0, name: 1, id_bwngr: 1}});
            res.json({result: true, message});
            next();
        } catch (e) {
            res.json({result: false, message: String(e)});
        }
    }


    static async getManager(req, res, next) {
        try {
            const id_bwngr = req.params.manager;
            const message = await ManagersDAO.getManager({id_bwngr: parseInt(id_bwngr)}, {projection: {_id:0, name: 1, balance: 1}});
            res.json({result: true, message});
            next();
        } catch (e) {
            res.json({result: false, message: String(e)});
        }
    }
}