const https = require('https')
const options = {
    hostname: 'biwenger.as.com',
    port: 443,
    path: '/api/v2/league/board?type=&offset=8&limit=8',
    method: 'GET',
    headers: {
        Authorization: ' Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOjI1MDc4MzE4LCJpYXQiOjE1MzY0NTI4ODd9.NasPTfg7723sCAmGtaZGdbEH2ZQ6uoC6PbKlfGz7fWI',
        'X-League': '238582',
        'X-User': '950942',
        'X-Version': '569',
        'X-Lang': 'es'
    }
  }

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`)
  
    res.on('data', (d) => {
      process.stdout.write(d)
    })
    res.on('end', () => console.log('\n'))
  }).on('error', (error) => {
    console.error(error)
  }).end()