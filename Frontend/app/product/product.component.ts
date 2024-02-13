import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import axios from 'axios';
import * as querystring from 'querystring';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {
  @Input() first_api_response_dict: any;
  init_status: boolean = false;
  collection: any = [];
  p: number = 1;
  product_api_response: any;
  products_in_cart: any = [];
  query_params = '';
  base_url = ""
  @Input() last_product_item_id: any;

  @Output() productClicked = new EventEmitter<any>();

  async getDocuments() {
    try {
      const url = `${this.base_url}/get_documents`; // Construct the URL with the query parameter
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  getImageLink(img_link: string) {
    if (img_link === '') {
      return './assets/ebay_default.jpg';
    }
    return img_link;
  }

  async getDocumentsIDS() {
    try {
      const url = `${this.base_url}/get_documents_ids`; // Construct the URL with the query parameter
      const response = await axios.get(url);
      this.products_in_cart = response.data
    
    } catch (error) {
      console.log(error);
    }
  }

  constructor() {
    for (let i = 1; i <= 50; i++) {
      this.collection.push(`result_${i}`);
    }
  }
  async ngOnInit() {
    this.init_status = true;
    await this.getDocumentsIDS();
    console.log('Product ..... ', this.first_api_response_dict);
  }

   checkProductInCart(item_id: string) {
    // await this.getDocumentsIDS()
    if (item_id in this.products_in_cart) {
        console.log("In Cart")
      return true;
    }

    return false;
  }

  //   async addProductInCart(item_id:string, image_url:string, title:string, price:any, shipping:string)
  async addProductInCart(item_num: any, item_dict: any) {
    console.log('Add to cart entire dict :: ', item_num);
    console.log(item_dict);
    console.log(this.first_api_response_dict[item_num]);
    try {
      item_dict['OneDayShipping'] =
        this.first_api_response_dict[item_num]['One Day Shipping'];
      item_dict['Shipping Locations'] =
        this.first_api_response_dict[item_num]['Shipping Locations'];
      item_dict['Expedited Shipping'] =
        this.first_api_response_dict[item_num]['Expedited Shipping'];
      item_dict['Handling time'] =
        this.first_api_response_dict[item_num]['Handling time'];
      item_dict['Shipping Cost'] =
        this.first_api_response_dict[item_num]['Shipping Cost'];
      this.query_params = querystring.stringify(item_dict);
      const url = `${this.base_url}/add_to_cart?${this.query_params}`; // Construct the URL with the query parameter
      const response = await axios.get(url);
      if (response.data['status']) {
        // this.products_in_cart[item_dict['ItemID']] = true;
        await this.getDocumentsIDS()
        console.log('Item Added to cart');
        console.log(this.products_in_cart);
      } else {
        console.log('Item could not be added!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  getStyle(temp_item_id: any = '') {
    if (temp_item_id === this.last_product_item_id) {
      return { 'background-color': 'rgb(199,200,202)' };
    }
    return {};
  }

  async deleteProductFromCart(item_id: string) {
    console.log('Function called');
    try {
      const url = `${this.base_url}/delete_from_cart?item_id=${item_id}`; // Construct the URL with the query parameter
      const response = await axios.get(url);
      if (response.data['status']) {
        await this.getDocumentsIDS();
        console.log('Item delted from cart');
        console.log(this.products_in_cart);
      } else {
        console.log('Item could not be deleted!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async productOnClick(
    item_id: string,
    item_num: string,
    clicked_product_image: string,
    clicked_product_title: string,
    clicked_product_shipping: string
  ) {
    console.log(item_id);
    try {
      const url = `${this.base_url}/search_product?item_id=${item_id}`; // Construct the URL with the query parameter
      const response = await axios.get(url);
      this.product_api_response = response.data;
      console.log('Product Clicked : ');
      console.log(this.product_api_response);
      this.product_api_response['OneDayShipping'] =
        this.first_api_response_dict[item_num]['One Day Shipping'];
      this.product_api_response['Shipping Locations'] =
        this.first_api_response_dict[item_num]['Shipping Locations'];
      this.product_api_response['Expedited Shipping'] =
        this.first_api_response_dict[item_num]['Expedited Shipping'];
      this.product_api_response['Handling time'] =
        this.first_api_response_dict[item_num]['Handling time'];
      this.product_api_response['Shipping Cost'] =
        this.first_api_response_dict[item_num]['Shipping Cost'];
      this.product_api_response['Image'] = clicked_product_image;

      this.productClicked.emit({
        api_response: this.product_api_response,
        in_cart: this.checkProductInCart(item_id),
        clicked_product_title: clicked_product_title,
        clicked_product_image: clicked_product_image,
        clicked_product_shipping: clicked_product_shipping,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async sendProductsInCart() {
    this.products_in_cart = await this.getDocumentsIDS();
    var docs = await this.getDocuments();
    return docs;
  }
}
