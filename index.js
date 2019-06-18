const http = require('http');
const {parse} = require('querystring');
const FORM_URLENCODED = 'application/x-www-form-urlencoded';
const has = Object.prototype.hasOwnProperty;

console.log('running ...');
const routeMangPath = process.cwd() + '/routing/routeManager';
const routeMang = require(routeMangPath);
const httpServer = http.createServer((req, res)=>{
    const router = new routeMang();
    const { method, url } = req;
    if (method == 'POST') {
        collectRequestData(req, (err,params) => {
            if(err){
                return res.end(JSON.stringify({status:false, message: err}));
            }    
            try {
                if(!has.call(params,'action')) {
                    res.end(JSON.stringify({status:true, message: 'Action missing!'}))
                }
                const result = router.handleRoute(url,params);
                res.end(JSON.stringify({status:true, message: result}));
            } catch(error) {
                res.end(JSON.stringify({status:false, message: error}));
            }
        });
    } else {
        res.end(JSON.stringify({status:false, message: 'Send a post'}));
    }
})
httpServer.listen(2020);

const collectRequestData = (request, callback) => {
    if(request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('error', (err) => {
            console.error('Error inside collectRequestData: ', err.stack);
            callback(err);
          }).on('data', chunk => {
            body += chunk.toString();
        }).on('end', () => {
            callback(null,parse(body));
        });
    } else {
        callback(null,'wrong content-type');
    }
}