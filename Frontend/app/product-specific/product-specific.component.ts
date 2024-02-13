import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as querystring from 'querystring';
import {
  NgbCarouselConfig,
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { ImgCarousalComponent } from '../img-carousal/img-carousal.component';
import axios from 'axios';

@Component({
  selector: 'app-product-specific',
  templateUrl: './product-specific.component.html',
  styleUrls: ['./product-specific.component.css'],
  providers: [NgbCarouselConfig],
})
export class ProductSpecificComponent implements OnInit {
  @Input() product_dict: any;
  init: boolean = false;
  product_tab: string = '';
  product_images: any;
  product_images_achieved: any;
  collection_1: any = [];
  collection_2: any = [];
  similar_products_dict: any;
  similar_product_status: boolean = false;
  show_more: boolean = false;
  sort_by_var: string = 'default';
  sort_by_order: string = 'asc';
  similar_products_dict_default: any;
  showCarousal = false;
  activeImageIndex: number = 0;
  products_in_cart_spc:any = {};
  base_url = ""
  @Input() clicked_product_image: string = '';
  @Input() clicked_product_title: string = '';
  @Input() clicked_product_shipping: string = '';

  @Output() backToMainPage = new EventEmitter<void>();

  constructor(private modalService: NgbModal) {}

  openCarouselDialog() {
    const modalRef: NgbModalRef = this.modalService.open(ImgCarousalComponent, {
      windowClass: 'image-carousel-modal',
    });
    modalRef.componentInstance.images = this.product_dict['Product Images'];
  }

  async getDocumentIDS() {
    try {
      const url = `${this.base_url}/get_documents_ids`; // Construct the URL with the query parameter
      const response = await axios.get(url);
      console.log('Getting Product IDs in cart ::');
      console.log(response.data);
      this.products_in_cart_spc = response.data;
      
    } catch (error) {
      console.log(error);
    }
  }

  async ngOnInit() {
    this.init = true;
    this.product_tab = 'product';
    this.product_images_achieved = false;
    await this.getDocumentIDS()
    console.log("Product in cart :::", this.products_in_cart_spc, this.product_dict["ItemID"])
    console.log('From product specific : ');
    console.log(this.product_dict);
  }

  getFacebookLink() {
    return `https://www.facebook.com/sharer/sharer.php?u=${this.product_dict['ItemURL']}&amp;src=sdkpreparse`;
  }
  nextImage() {
    this.activeImageIndex =
      (this.activeImageIndex + 1) % this.product_dict['Product Images'].length;
  }

  prevImage() {
    if (this.activeImageIndex === 0) {
      this.activeImageIndex = this.product_dict['Product Images'].length - 1;
    } else {
      this.activeImageIndex =
        (this.activeImageIndex - 1) %
        this.product_dict['Product Images'].length;
    }
  }

  async addProductInCart(
    item_id: string,
    image_url: string,
    title: string,
    price: any,
    shipping: string
  ) {
    console.log('From Details Page :: ', this.product_dict);
    try {
        this.product_dict["Image"] = image_url
      var query_params = querystring.stringify(this.product_dict);
      // const url = `${this.base_url}/add_to_cart?item_id=${item_id}&image=${image_url}&title=${title}&price=${price}&shipping=${shipping}`; // Construct the URL with the query parameter
      const url = `${this.base_url}/add_to_cart?${query_params}`;
      const response = await axios.get(url);
      if (response.data['status']) {
        await this.getDocumentIDS()
      } else {
        console.log('Item could not be added!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteProductFromCart(item_id: string) {
    console.log('Function called :::::::: ');
    console.log(this.product_dict["ItemID"])
    try {
      const url = `${this.base_url}/delete_from_cart?item_id=${item_id}`; // Construct the URL with the query parameter
      const response = await axios.get(url);
      if (response.data['status']) {
        await this.getDocumentIDS()
      } else {
        console.log('Item could not be deleted!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  checkProductInCart(temp_itemID:string)
  {
    console.log("From Specific page::",this.products_in_cart_spc)
    if(temp_itemID in this.products_in_cart_spc)
    {
        return true;
    }
    return false;
  }

  getStarColor(star_color: string) {
    if (star_color === 'Yellow' || star_color === 'YellowShooting') {
      return 'yellow';
    } else if (star_color === 'Blue') {
      return 'blue';
    } else if (
      star_color === 'Turquoise' ||
      star_color === 'TurquoiseShooting'
    ) {
      return 'turquoise';
    } else if (star_color === 'Purple' || star_color === 'PurpleShooting') {
      return 'purple';
    } else if (star_color === 'Red' || star_color === 'RedShooting') {
      return 'red';
    } else if (star_color === 'Green' || star_color === 'GreenShooting') {
      return 'green';
    } else if (star_color === 'SilverShooting') {
      return 'silver';
    }
    return '';
  }

  backButtonClicked() {
    console.log('Back Button Clicked');
    this.backToMainPage.emit();
  }

  checkForClass(ind: number): boolean {
    if (ind > 5) {
      return true;
    }
    return false;
  }
  compare_by_product_name(a: any, b: any) {
    if (a['Product Name'] < b['Product Name']) {
      return -1;
    }
    if (a['Product Name'] > b['Product Name']) {
      return 1;
    }
    return 0;
  }

  compare_by_price(a: any, b: any) {
    if (a['Price'] < b['Price']) {
      return -1;
    }
    if (a['Price'] > b['Price']) {
      return 1;
    }
    return 0;
  }

  compare_by_shipping_cost(a: any, b: any) {
    if (a['Shipping Cost'] < b['Shipping Cost']) {
      return -1;
    }
    if (a['Shipping Cost'] > b['Shipping Cost']) {
      return 1;
    }
    return 0;
  }
  compare_by_days_left(a: any, b: any) {
    if (a['Days Left'] < b['Days Left']) {
      return -1;
    }
    if (a['Days Left'] > b['Days Left']) {
      return 1;
    }
    return 0;
  }

  sort_array() {
    if (this.sort_by_var === 'product_name') {
      this.similar_products_dict.sort(this.compare_by_product_name);
    } else if (this.sort_by_var === 'price') {
      this.similar_products_dict.sort(this.compare_by_price);
    } else if (this.sort_by_var === 'shipping_cost') {
      this.similar_products_dict.sort(this.compare_by_shipping_cost);
    } else if (this.sort_by_var === 'days_left') {
      this.similar_products_dict.sort(this.compare_by_days_left);
    } else if (this.sort_by_var === 'default') {
      console.log('Default Selected');
      this.similar_products_dict = [...this.similar_products_dict_default];
      console.log(this.similar_products_dict);
    }
    if (this.sort_by_order === 'dsc' && this.sort_by_var !== 'default') {
      console.log(this.sort_by_order);
      this.similar_products_dict = [...this.similar_products_dict.reverse()];
    }
  }
  sort_by(event: any) {
    this.sort_by_var = event.target.value;
    console.log(this.sort_by_var);
    this.sort_array();
  }

  get_sort_by_order(event: any) {
    this.sort_by_order = event.target.value;
    this.sort_array();
  }

  show_more_less_clicked() {
    if (this.show_more === true) {
      this.show_more = false;
    } else {
      this.show_more = true;
    }
  }
  async get_similar_products() {
    try {
      const url = `${this.base_url}/get_similar_products?item_id=${this.product_dict['ItemID']}`; // Construct the URL with the query parameter
      const response = await axios.get(url);
      console.log('Getting Similar Products : ');
      // console.log(response.data["count"])
      this.similar_products_dict = [...response.data['products_array']];
      // console.log("ABCS", this.similar_products_dict)
      this.similar_products_dict_default = [...response.data['products_array']];
      this.similar_product_status = true;
      if (response.data['count'] > 5) {
        for (let i = 0; i < 5; i++) {
          this.collection_1.push(`${i}`);
        }

        for (let i = 5; i < response.data['count']; i++) {
          this.collection_2.push(`${i}`);
        }
      } else {
        for (let i = 0; i < response.data['count']; i++) {
          this.collection_1.push(`${i}`);
        }
      }
      console.log(this.similar_products_dict);
    } catch (error) {
      console.log(error);
    }
  }
  async get_photos() {
    try {
      const url = `${this.base_url}/get_images?title=${this.product_dict['Title']}`; // Construct the URL with the query parameter
      const response = await axios.get(url);
      console.log('Photo Links');
      this.product_images = response.data;
      console.log(this.product_images);
    } catch (error) {
      console.error('Error fetching Images:', error);
    }
  }
  changeTab(tab_name: string) {
    this.product_tab = tab_name;
    if (this.product_tab === 'photos') {
      this.get_photos();
    }

    if (this.product_tab === 'similar_products') {
      this.get_similar_products();
    }
  }
}
