/**
  * HappyOrder node backend for app consumption
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */


// var jsonConfig = require('../config/id.json');

export class Config {
  // ref to Express instance
  public port: number;

  // the mask for the port to open
  // 0.0.0.0 will respond to any IP addresses
  // 192.168.11.31 from a specific IP address only.
  public localMask: string;

  // the address of the HappyOrder/unikas installation
  public remoteHost: string;
  public fullConfig: any;

  constructor() {
    this.port = 8080;
    this.remoteHost = "127.0.0.1";
    this.localMask = "0.0.0.0";
    this.fullConfig = {};
    this.loadConfig();
  }

  loadConfig() {
    var fs = require('fs');
    var path = require('path');

    var configFileName = '../../config/id.json';
    var fullPath = path.join(__dirname, configFileName);
    // console.log('load Config...', fullPath);

    var tContents = fs.readFileSync(fullPath, 'utf8');
    // console.log('a1:',tContents);
    var jContents = JSON.parse(tContents);
    if (jContents && jContents.web && jContents.web.port) {
      this.port = jContents.web.port;
      this.remoteHost = jContents.web.remoteHost;
      if (jContents.web.localMask) {
        this.localMask = jContents.web.localMask;
      }
      this.fullConfig = jContents;
    }
    // console.log('a2:',JSON.stringify(jContents));

    // this.remoteHost = encodeURIComponent(this.remoteHost);

  }
}
