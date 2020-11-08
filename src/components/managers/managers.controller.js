import ManagersDAO from './managersDAO';


export default class ManagerController {
    static async getAllManagers(req, res, next) {
        try {
            const message = await ManagersDAO.getManager({}, {projection: {_id:0, name: 1, id_bwngr: 1}});
            // const message = [
            //     {id:1, name:'manager 1',balance:1500000},
            //     {id:2, name:'manager 2',balance:2000000},
            //     {id:3, name:'manager 3',balance:2000000}]
            res.json({result: true, message});
            // next();
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