/**
  * HappyOrder app for phones
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */

import { Component } from '@angular/core';
import {LiveService} from  '../../services/live.service';
import {LoginService} from  '../../services/login.service';

@Component({
  selector: 'connection-status',
  templateUrl: 'connection-status.html'
})
export class ConnectionStatusComponent {
  private showStatusMessage: boolean;
  constructor(private liveService:LiveService,
          private loginService: LoginService) {
    this.showStatusMessage = false;
  }
  getClass() {
    let self = this;
    let cssClass = [];
    if (self.liveService.connectionStatus.connected) {
      cssClass.push('connected');
    }
    if (self.liveService.connectionStatus.socketConnected) {
      cssClass.push('socketConnected');
    }
    return cssClass.join(" ");
  }
  toggleStatus() {
    let self = this;
    this.showStatusMessage = !this.showStatusMessage;
    if (this.showStatusMessage) {
      setTimeout(()=>{
        self.showStatusMessage=false;
      },5000);
    }
  }
  getStatusMessage() {
    let result='KO';
    if (this.liveService.connectionStatus.connected && this.liveService.connectionStatus.socketConnected) {
      result = 'Ok';
    }
    let message = this.liveService.connectionStatus.message;
    if (message.length > 0 ) {
      return `${result} (${this.liveService.connectionStatus.message})`;
    }
    else {
      return result;
    }
    
  }
}
