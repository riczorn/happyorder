/**
  * HappyOrder app for phones

Show an animated slideshow;

  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */

import { Component, ViewChild } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { LiveService } from  '../../services/live.service';
import { TavoliPage } from '../../pages/tavoli/tavoli';


@Component({
  selector: 'back-slides',
  templateUrl: 'back-slides.html'
})
export class BackSlidesComponent {
  @ViewChild(Slides) slides: Slides;
  private clickCounterResetTimer: any;
  private clickCounter : number;
  // https://ionicframework.com/docs/api/components/slides/Slides/

  constructor(private liveService:LiveService, public navCtrl: NavController) {
    // console.log('init: ');
    let self = this;
    self.clickCounter = 0;
    // setTimeout( () => {
    //   //self.goNext();
    //   console.log('end init - hide loading', self.slides.length(),self.liveService.slideshow.length);
    //   self.initialising = false;
    //   // if (self.slides && self.slides.length()) {
    //   //   self.slides.lockSwipes(true);
    //   // }
    // },3500);
    // setTimeout( () => {
    //   console.log('slides update', self.slides.length(),self.liveService.slideshow.length);
    //   //  self.slides.update();
    // },5000);
    setTimeout( () => {
      // console.log('start auto (NOT!)' , self.slides.length(), self.slides);
      // console.log(self.liveService.slideshow.length);
      if (self.slides 
          && self.slides.length
          && (self.slides.length()>0)) {
        // console.log('starting Slideshow...');
        // this.slides.lockSwipes(true);  //non so perché inchioda tutto!
        self.slides.autoplay = 6000 + Math.random()*300;
        self.slides.startAutoplay();

      }
    },6000);
  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit',this.slides.length());
    //
    // this.slides.update();
  }

  goToSlide() {
      this.slides.slideTo(2, 500);
      // startAutoplay()
      // lockSlides()
    }
  handleClick() {
    // console.log('goNext', this.initialising);
    let self = this;
    this.clickCounter += 1;
    if (this.clickCounter >= 10) {
      // goto tables
      self.navCtrl.setRoot(TavoliPage);
    }
    if (this.clickCounterResetTimer) {
      clearTimeout(this.clickCounterResetTimer);
    }
    this.clickCounterResetTimer = setTimeout( () => {
      self.clickCounterResetTimer = 0;
      self.clickCounter = 0;
    }, 30000);

    // this.slides.lockSwipes(false); // Unlock the slides
    // this.slides.slideNext(500, false)
    // this.slides.lockSwipes(true);  //
    // this.slides.startAutoplay();

    ;
  }
}
