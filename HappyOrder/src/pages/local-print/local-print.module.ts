import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocalPrintPage } from './local-print';
// import { Bixolon } from '@ionic-native/bixolon';

@NgModule({
  declarations: [
    LocalPrintPage,
  ],
  imports: [
    IonicPageModule.forChild(LocalPrintPage),
  ]
  // ,
  // providers: [
  //   Bixolon
  // ]
})
export class LocalPrintPageModule { }
