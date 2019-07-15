import http from 'http';
import parser from 'querystring';
import { MongoClient } from "mongodb";
import UsersDAO from "./dao/usersDAO";
import ManagersDAO from "./dao/managersDAO";
import PlayersDAO from "./dao/playersDAO";
import router from './routing/routeManager';

const FORM_URLENCODED = 'application/x-www-form-urlencoded';
const has = Object.prototype.hasOwnProperty;
console.log('running ...');

export default http.createServer((req, res) => {
    const { method, url } = req;
    console.log(`${method} ${url.split('?')[0]}`);
    collectRequestData(req, async (err, params) => {
        if (err) {
            return res.end(JSON.stringify({ status: false, message: err }));
        }
        if (!has.call(params, 'action')) {
            res.end(JSON.stringify({ status: true, message: 'Action missing!' }))
        }
        if (!has.call(params, 'league')) {
            res.end(JSON.stringify({ status: true, message: 'League missing!Spanish La Liga will be used by default' }))
        }
        try {
            MongoClient.connect(
                process.env.BWNGR_DB_URI,
                { useNewUrlParser: true }
            ).catch(err => {
                console.error('=====Error:', err.toString());
                console.error('=====Error stack:', err.stack);
                process.exit(1)
            }).then(async client => {
                const db = has.call(params, 'league') && params['league'] === 'pl'
                            ? client.db(process.env.BWNGR_DB_PL) 
                            : client.db(process.env.BWNGR_DB);
                 
                await UsersDAO.injectDB(db);
                await PlayersDAO.injectDB(db);
                await ManagersDAO.injectDB(db);
                const result = await router.handleRoute(url, params);
                res.end(JSON.stringify(result));
            });
        } catch (error) {
            console.log('Error stack:', error.stack)
            console.log('\n===============================================\n')
            return res.end(JSON.stringify({ success: false, message: error.toString() }));
        }
    });
})

const collectRequestData = (request, callback) => {
    if (request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('error', (err) => {
            console.error('Error inside collectRequestData: ', err.stack);
            callback(err);
        }).on('data', chunk => {
            body += chunk.toString();
        }).on('end', () => {
            callback(null, parser.parse(body));
        });
    } else {
        callback(null, 'wrong content-type');
    }
}