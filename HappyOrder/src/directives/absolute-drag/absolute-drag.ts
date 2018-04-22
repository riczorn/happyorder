import { Directive, Input, Output, ElementRef, Renderer, EventEmitter } from '@angular/core';
import { DomController } from 'ionic-angular';
import { LiveService } from  '../../services/live.service';

@Directive({
  selector: '[absolute-drag]'
})
/*
 * Implement the drag logic for tables. The callback event dropEvent is 
 * passed in the directive markup.
 * https://www.joshmorony.com/building-an-absolute-drag-directive-in-ionic-2/
 */
export class AbsoluteDrag {
 
    @Input('startLeft') startLeft: any;
    @Input('startTop') startTop: any;
    @Input('dragTop') dragTop: any;
// directives explained https://www.codeproject.com/Articles/1168139/Angular-Directives
    @Output('dropEvent') dropEvent: EventEmitter<any> = new EventEmitter();

    private x:number;
    private y:number;
 
    constructor(public element: ElementRef, 
      public renderer: Renderer, public domCtrl: DomController,
    private liveService: LiveService) {
 
    }
 
    ngAfterViewInit() {
      if (!this.liveService.options.GraphicalTables) {
        return false;
      }
        this.renderer.setElementStyle(this.element.nativeElement, 'position', 'absolute');
        this.renderer.setElementStyle(this.element.nativeElement, 'left', this.startLeft + 'px');
        this.renderer.setElementStyle(this.element.nativeElement, 'top', this.startTop + 'px');
 
        this.x = parseInt(this.element.nativeElement.style.left);
        this.y = parseInt(this.element.nativeElement.style.top);

        
        let hammer = new window['Hammer'](this.element.nativeElement);
        /* https://github.com/hammerjs/hammer.js/blob/master/hammer.js
            pan,panstart,panmove,panend,pancancel,panleft,panright,
            panup,pandown
        */
        hammer.get('pan').set({ 
          direction: window['Hammer'].DIRECTION_ALL 
        });
 
        hammer.on('pan', (ev) => {
          this.handlePan(ev);
        });
        hammer.on('panend', (ev) => {
          this.handlePanEnd(ev);
        });
        
    }
 
    /**
     * https://hammerjs.github.io
     * Pan is a recognizer, an advanced gesture handler.
     * @param ev 
     */
    handlePan(ev){
        let newLeft = ev.center.x-parseInt(ev.target.style.width)/2;// - (ev.target.width/2);
        let newTop = ev.center.y-this.dragTop-parseInt(ev.target.style.height)/2;//-(ev.target.height/2);;
 
        this.domCtrl.write(() => {
            this.renderer.setElementStyle(this.element.nativeElement, 'left', newLeft + 'px');
            this.renderer.setElementStyle(this.element.nativeElement, 'top', newTop + 'px');
        });
    }
      
    handlePanEnd(ev){
      if (this.dropEvent && this.dropEvent.emit) {
        this.dropEvent.emit(ev);
      }
      // send the table back where it was:
      this.domCtrl.write(() => {
        this.renderer.setElementStyle(this.element.nativeElement, 'left', this.x + 'px');
        this.renderer.setElementStyle(this.element.nativeElement, 'top', this.y + 'px');
      });
    }
}