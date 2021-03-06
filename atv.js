var webservers = require("./webserver");
var dns = require('./dns');
var ip = require("ip");
var logger = require('./logger');

var fs = require('fs');
if (!fs.existsSync('assets/certificates/trailers.cer')){
    var pem = require('pem');
    logger.warning('SSL Certificate does not exist, Please restart PopcornTV once the process ends!');
    pem.createCertificate({days:720, selfSigned:true, country: 'US', commonName: 'trailers.apple.com'}, function(err, keys){
        fs.writeFile('assets/certificates/trailers.cer', keys.certificate+ '\n' + keys.serviceKey);
        fs.writeFile('assets/certificates/trailers.pem', keys.certificate+ '\n' + keys.serviceKey);
    });
} else if (fs.existsSync('config.json')) {
    var data = fs.readFileSync('./config.json'), config;
    try {
        config = JSON.parse(data);
        const LOCAL_IP = config.ip;
        logger.notice("Starting PopcornTV");
		dns.startDnsProxy(LOCAL_IP);
		webservers.startWebServer(LOCAL_IP);
		webservers.startSSLWebServer(LOCAL_IP);
    } catch (err) {
        logger.error('There is an error starting Popcorn TV, please post this on the Github page')
        logger.error(err);
        process.exit();
    }
} else {
    var myOptions = {
        ip: ip.address(),
        default_dns: '8.8.8.8'
    };

    var data = JSON.stringify(myOptions, null, 4);

    fs.writeFile('./config.json', data, function(err) {
        if (err) {
            logger.error('There has been an error generating the Config, please report this error on the github page!');
            logger.error(err.message);
            return;
        }
        var data = fs.readFileSync('./config.json'), config;
        try {
            config = JSON.parse(data);
            const LOCAL_IP = config.ip;
            logger.notice("Starting PopcornTV");
            dns.startDnsProxy(LOCAL_IP);
            webservers.startWebServer(LOCAL_IP);
            webservers.startSSLWebServer(LOCAL_IP);
        } catch (err) {
            logger.error('There is an error starting Popcorn TV, please post this on the Github page')
            console.error(err);
            process.exit();
        }
    });
}