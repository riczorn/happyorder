/**
  * HappyOrder node backend for app consumption
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */


import hOConfigModule = require('./lib/config');
import WebService from './lib/webservice';
var config = new hOConfigModule.Config();
var webservice = new WebService(config);

import App from './lib/app';
import * as http from 'http';

var port =  8080; // default port, overridden by configuration (/lib/config.ts)
let localMask = "0.0.0.0";
webservice.remoteHost = '127.0.0.1'

if (config) {
  console.log('Read config',config);
 port = config.port;
 localMask = config.localMask ? config.localMask : localMask;
 webservice.remoteHost = config.remoteHost;
 webservice.config = config;
}
console.log('Ignition sequence ***********');
console.log('port',port,'localMask',localMask, 'remoteHost', webservice.remoteHost);

App.set('port', port);
App.set('config', config);
App.set('webservice', webservice);
//create a server and pass our Express app to it.
const server = http.createServer(App);
server.listen(port, localMask);
// for security reasons, this should go in the options
server.on('listening', onListening);

webservice.setupSocket(server);




//function to note that Express is listening
function onListening(): void {
 console.log(`Listening on port `+port);
}
