import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgbActiveModal, NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';




@Component({
  selector: 'app-img-carousal',
  templateUrl: './img-carousal.component.html',
  styleUrls: ['./img-carousal.component.css']
})
export class ImgCarousalComponent {
    @Input() images:string[] = [];
    activeImageIndex: number = 0;
    init=false
    constructor(public activeModal: NgbActiveModal, config: NgbCarouselConfig)
    {
        this.init=true
        config.interval = 0
        console.log("Carousal called")
        console.log(this.images)
    }

    closeCarousal()
    {
        this.activeModal.close()
    }

}
