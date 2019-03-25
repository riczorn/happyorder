/**
 *  HappyOrder app
 *  Datatype OrderItem
 *
 *  Implements the User; created by loginService.
 *
 * @package    HappyOrder
 * @author     Riccardo Zorn <code@fasterjoomla.com>
 * @copyright  2002 - 2017 Riccardo Zorn
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */
import { LiveService } from '../services/live.service';

export class User {
  public email: string;
  public password: string;
  public login: string;
  public name: string;

  public loggedIn: boolean;
  public autoLogin: boolean;

  public clerkId: number;
  public tableId: number; // the default table id:
  public defaultTableId: number;
  public extraDisplay: boolean;
  public extraDisplayName: string;

  public table: any;
  // public tableName: string;
  // when logging in with this (idTavolo= in the ukClient.settings)
  // automatically the default table is set and the orders page is shown in the app.
  public status: string;
  public errorMessage: string;
  public serverUrl: string;
  private liveService: LiveService;




  constructor(liveService: LiveService) {
    // persist data from localStorage through loginService
    this.loggedIn = false;
    this.extraDisplay = false;
    this.extraDisplayName = '';
    this.defaultTableId = 0;
    this.clerkId = -1;
    this.autoLogin = false;
    //this.serverUrl = '192.168.0.1:8080';
    this.serverUrl = 'my.happyorder.it/my';

    this.liveService = liveService;
  }

  // tests the settings object to see if we have a privilege.
  hasPrivilege(privilege: string) {
    //  console.log('hasPrivilege',privilege);
    let clerk: any = this.getSettingsClerk();
    if (clerk && clerk.hasPrivilege) {
      //  console.log('hasPrivilege && clerk.hasPrivilege TRUE',clerk);
      return clerk.hasPrivilege(privilege);
    } else {
      //  console.log('hasPrivilege && !clerk.hasPrivilege FALSE',clerk);
      return false;
    }
  }

  getSettingsClerk(): any {
    //  console.log('getSettingsClerk');
    for (let clerk of this.liveService.settings.clerks) {
      // now iterate over all clerks
      if (clerk.id == this.clerkId) {
        return clerk;
      }
    }
    return null;
  }
}
