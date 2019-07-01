import http from 'http';
import parser from 'querystring';
import router from './routing/routeManager';

const FORM_URLENCODED = 'application/x-www-form-urlencoded';
const has = Object.prototype.hasOwnProperty;

console.log('running ...');


export default http.createServer((req, res) => {
    const { method, url } = req;
    console.log(`${method} ${url}`);
    if (method == 'POST') {
        collectRequestData(req, async (err, params) => {
            if (err) {
                return res.end(JSON.stringify({ status: false, message: err }));
            }
            if (!has.call(params, 'action')) {
                res.end(JSON.stringify({ status: true, message: 'Action missing!' }))
            }
            try {
                const result = await router.handleRoute(url, params);    
                res.end(JSON.stringify(result));
            } catch (error) {
                console.log('Error stack:', error.stack)
                console.log('\n===============================================\n')
                return res.end(JSON.stringify({ success: false, message: error.toString() }));
            }
        });
    } else {
        res.end(JSON.stringify({ status: false, message: 'Send a post' }));
    }
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