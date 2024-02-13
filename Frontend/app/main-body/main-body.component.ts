import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import * as querystring from 'querystring';
import { Observable } from 'rxjs';
import axios from 'axios';
import { ProductComponent } from '../product/product.component';
import {
  NgbProgressbarConfig,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-main-body',
  templateUrl: './main-body.component.html',
  styleUrls: ['./main-body.component.css'],
  providers: [NgbProgressbarConfig],
})

export class MainBodyComponent implements OnInit {
  keyword: string = '';
  category: string = '';
  condition_new: boolean = false;
  condition_used: boolean = false;
  condition_unspecified: boolean = false;
  shipping_local: boolean = false;
  shipping_free: boolean = false;
  distance: number = 10;
  from: string = 'from_cur';
  manual_zip_entry = '';
  query_params: string = '';
  query_params_dict: any;
  first_api_response: any;
  first_api_status: boolean = false;
  product_clicked: boolean = false;
  product_specific_dict: any;
  products_in_cart_main: any;
  tab: string = 'results';
  is_clicked_product_in_cart: boolean = false;
  clicked_product_image: string = '';
  clicked_product_title: string = '';
  clicked_product_shipping: string = '';
  total_cart_sum: number = 0;
  last_product_status: boolean = false;
  last_product_dict: any;
  last_product_item_id: string = '';
  last_product_in_cart: any;
  last_product_title: any;
  last_product_image_url: any;
  last_product_shipping: any;
  no_data_found = false;
  data_validation = false;
  locationDetails: any = undefined;
  keyword_validation: boolean = false;
  zip_code_validation: boolean = false;
  zip_code_length = false;

  progress_bar_width = 0;
  progress_bar_status_1: boolean = false;
  progress_bar_status_2: boolean = false;
  current_tab = ''; // main_page, product_tab
  doc_ids_in_cart: any = [];

  zip_codes: any;
  web_app = false;
  base_url = ""

  @ViewChild(ProductComponent) product_component: ProductComponent | undefined;

  async getDocumentIDS() {
    try {
      const url = `${this.base_url}/get_documents_ids`; // Construct the URL with the query parameter
      const response = await axios.get(url);
      console.log('Getting Product IDs in cart ::');
      console.log(response.data);
      this.doc_ids_in_cart = response.data;
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  checkProductInCart(temp_item_id: string) {
    // await this.getDocumentIDS()
    if (temp_item_id in this.doc_ids_in_cart) {
      return true;
    }
    return false;
  }

  constructor(
    private httpClient: HttpClient,
    config_progress_bar: NgbProgressbarConfig
  ) {
    config_progress_bar.max = 100;
    config_progress_bar.striped = true;
    config_progress_bar.animated = true;
    config_progress_bar.type = 'primary';
    config_progress_bar.height = '20px';
  }

  async getProductsInCart() {
    try {
      const url = `${this.base_url}/get_documents`; 
      const response = await axios.get(url);
      this.products_in_cart_main = response.data;
      console.log('Product Calling from Cart :: ');
      console.log(this.products_in_cart_main);
    } catch (error) {
      console.log(error);
    }
  }

  async getTotalSum() {
    await this.getProductsInCart();
    await this.getDocumentIDS();
    this.total_cart_sum = 0;
    for (let i = 0; i < this.products_in_cart_main.length; i++) {
      this.total_cart_sum += Number(this.products_in_cart_main[i]['Price']);
    }
    this.total_cart_sum = Number(this.total_cart_sum.toFixed(2));
    console.log(this.total_cart_sum);
  }

  async getZipCodes(zip_starting: string) {
    const url = `${this.base_url}/get_zip_codes?starts_with=${zip_starting}`;
    var temp_zip_codes = await axios.get(url);
    this.zip_codes = temp_zip_codes['data']['zipCodes'];
  }

  async onInputChange(value: string) {
    if (value.length >= 3) {
      await this.getZipCodes(value);
      this.zip_code_length = true;
      console.log('zip codes : ', this.zip_codes);
      if (value.length == 5) {
        this.manual_zip_entry = value;
      }
    } else {
      this.zip_codes = [];
    }
  }

  async ngOnInit() {
    await this.getProductsInCart();
    await this.getTotalSum();
    await this.getDocumentIDS();
    if (this.from === 'from_cur') {
      console.log(this.from);
      const url = 'https://ipinfo.io/json?token=78fadea1d2537b'; // Replace with your actual token
      axios
        .get(url)
        .then((response) => {
          this.locationDetails = response.data['postal'];
          console.log(this.locationDetails);
        })
        .catch((error) => {
          console.error('Error fetching data from IPinfo:', error);
        });
    } else if (this.from === 'from_zip') {
    }
  }
  async removeFromCart(item_id: string) {
    try {
      const url = `${this.base_url}/delete_from_cart?item_id=${item_id}`; // Construct the URL with the query parameter
      const response = await axios.get(url);
      console.log(response.data);
      if (response.data['status']) {
        console.log('trying to remove');
        await this.getProductsInCart();
        await this.getTotalSum();
        await this.getDocumentIDS();
        console.log(this.products_in_cart_main);
      } else {
        console.log('Item could not be deleted!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  change_tab(tab_name: string) {
    this.tab = tab_name;
    if (this.tab == 'wishlist') {
      this.product_clicked = false;
      this.current_tab = 'main_page';
    }
    if (this.tab === 'results') {
      if (this.web_app === true) {
        this.current_tab = 'main_page';
        this.first_api_status = true;
      }
    }
  }
  make_url() {
    const params = new Map<string, any>();
    params.set('OPERATION-NAME', 'findItemsAdvanced');
    params.set('SERVICE-VERSION', '1.0.0');
    params.set('SECURITY-APPNAME', 'KshitijA-hw2-PRD-694557f6d-81ddebc1');
    params.set('RESPONSE-DATA-FORMAT', 'JSON');
    params.set('REST-PAYLOAD', '');
    params.set('paginationInput.entriesPerPage', 50);

    var condition_array: string[] = [];
    if (this.condition_new !== false) {
      condition_array.push('New');
    }

    if (this.condition_used !== false) {
      condition_array.push('Used');
    }

    if (this.condition_unspecified !== false) {
      condition_array.push('Unspecified');
    }

    if (this.keyword !== '') {
      params.set('keywords', this.keyword);
    }

    if (this.from !== '' && this.from === 'from_cur') {
      params.set('buyerPostalCode', this.locationDetails);
    }
    if (this.from !== '' && this.from === 'from_zip') {
      params.set('buyerPostalCode', this.manual_zip_entry?.toString());
    }

    if (this.category !== '') {
      params.set('categoryId', this.category);
    }

    params.set('itemFilter(0).name', 'HideDuplicateItems');

    params.set('itemFilter(0).value', 'true');

    var count = 1;

    if (this.distance !== null) {
      params.set('itemFilter(' + count.toString() + ').name', 'MaxDistance');
      params.set('itemFilter(' + count.toString() + ').value', this.distance);
      count++;
    }
    if (this.shipping_free === true) {
      params.set(
        'itemFilter(' + count.toString() + ').name',
        'FreeShippingOnly'
      );
      params.set('itemFilter(' + count.toString() + ').value', 'true');
      count++;
    }

    if (this.shipping_local === true) {
      params.set(
        'itemFilter(' + count.toString() + ').name',
        'LocalPickupOnly'
      );
      params.set('itemFilter(' + count.toString() + ').value', 'true');
      count++;
    }
    if (condition_array.length > 0) {
      var val_cnt = 0;
      params.set('itemFilter(' + count.toString() + ').name', 'Condition');

      for (let i = 0; i < condition_array.length; i++) {
        params.set(
          'itemFilter(' +
            count.toString() +
            ').value(' +
            val_cnt.toString() +
            ')',
          condition_array[i]
        );
        val_cnt++;
      }
    }

    params.set('outputSelector(0)', 'SellerInfo');
    params.set('outputSelector(1)', 'StoreInfo');
    console.log(params);

    this.query_params = querystring.stringify(Object.fromEntries(params));
    console.log(this.query_params);
  }

  async callServer() {
    try {
      const url = `${this.base_url}/search?${this.query_params}`; // Construct the URL with the query parameter
      console.log(url)
      const response = await axios.get(url);
      this.first_api_response = response.data;
      if (this.first_api_response['count'] > 0) {
        this.current_tab = 'main_page';
        this.first_api_status = true;
        this.web_app = true;
        this.no_data_found = false;
        console.log(this.first_api_response);
      } else {
        console.log('No Data Found');
        this.no_data_found = true;
        this.current_tab = 'main_page';
        this.first_api_status = false;
        this.product_clicked = false;
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  validate_data() {
    if (this.keyword === '' || this.keyword.trim() === '') {
      return true;
    }
    if (
      this.from === 'from_zip' &&
      (this.manual_zip_entry === '' || this.manual_zip_entry.length < 5)
    ) {
      console.log('validating data : zip-code', this.manual_zip_entry);
      return true;
    }
    return false;
  }

  async onDetailsButtonClick() {
    this.product_specific_dict = this.last_product_dict;
    console.log("Details Clicked :::::: ", this.product_specific_dict)
    this.current_tab = 'product_tab';
    this.product_clicked = true;
    this.first_api_status = false;
    this.no_data_found = false;
    await this.getDocumentIDS()
    
    this.is_clicked_product_in_cart = this.last_product_in_cart;
    this.clicked_product_title = this.last_product_title;
    this.clicked_product_image = this.last_product_image_url;
    this.clicked_product_shipping = this.last_product_shipping;
  }

  productClickDetected(specific_product: any) {
    this.product_specific_dict = specific_product['api_response'];
    this.current_tab = 'product_tab';

    if (this.last_product_status === false) {
      this.last_product_status = true;
    }
    this.last_product_dict = specific_product['api_response'];
    console.log('From Main Body : ');

    this.product_clicked = true;
    this.first_api_status = false;

    // this.last_product_status = true
    this.is_clicked_product_in_cart = specific_product['in_cart'];
    this.clicked_product_title = specific_product['clicked_product_title'];
    this.clicked_product_image = specific_product['clicked_product_image'];
    this.clicked_product_shipping =
      specific_product['clicked_product_shipping'];
    this.last_product_title = this.clicked_product_title;
    this.last_product_image_url = specific_product['Image'];
    this.last_product_shipping = this.clicked_product_shipping;
    this.last_product_in_cart = this.is_clicked_product_in_cart;
    this.last_product_item_id = this.last_product_dict['ItemID'];

    console.log('Clicked Product :: ', this.last_product_item_id);
  }

  productClickDetectedFromWishList(specific_product: any) {
    this.product_specific_dict = specific_product;
    this.current_tab = 'product_tab';

    if (this.last_product_status === false) {
      this.last_product_status = true;
    }
    this.last_product_dict = specific_product;
    console.log('From Main Body : ');

    this.product_clicked = true;
    this.first_api_status = false;

    this.is_clicked_product_in_cart = true;
    this.clicked_product_title = specific_product['Title'];
    this.clicked_product_image = specific_product['Image'];

    console.log("Click from Wishlist :::::",specific_product)
    this.clicked_product_shipping = specific_product['Shipping'];
    this.last_product_title = this.clicked_product_title;
    this.last_product_image_url =specific_product['Image'];
    this.last_product_shipping = this.clicked_product_shipping;
    this.last_product_in_cart = this.is_clicked_product_in_cart;
    this.last_product_item_id = this.last_product_dict['ItemID'];

    console.log('Clicked Product :: ', this.last_product_item_id);
  }

  showMainTable() {
    console.log('Routed to Main Body!');
    this.current_tab = 'main_page';
    this.product_clicked = false;
    if (this.tab === 'results') {
        console.log(this.first_api_response)
      if (this.first_api_response) {
        this.first_api_status = true;
      }
      else
      {
        this.no_data_found = true
      }
    }
  }

  async showProgressBar() {
    console.log('Progress bar function!!');
    this.progress_bar_status_1 = true;
    const interval = setInterval(() => {
      if (this.progress_bar_width >= 100) {
        clearInterval(interval);
        this.progress_bar_status_1 = false;
      } else {
        this.progress_bar_width++;
      }
    }, 20);
  }

  async showProgressBarOnClick() {
    console.log('Progress bar function!!');
    this.progress_bar_status_2 = true;
    this.progress_bar_width = 0;
    const interval = setInterval(() => {
      if (this.progress_bar_width >= 100) {
        clearInterval(interval);
        this.progress_bar_status_2 = false;
      } else {
        this.progress_bar_width++;
      }
    }, 20);
  }
  async onSubmit() {
    this.data_validation = true;
    this.showProgressBar();
    console.log('Form Data:');
    console.log(this.keyword);
    console.log(this.category);
    console.log('Condition New : ', this.condition_new);
    console.log('Condition Used ', this.condition_used);
    console.log('Condition Unspecified ', this.condition_unspecified);
    console.log('Shipping Local ', this.shipping_local);
    console.log('Shipping Free ', this.shipping_free);
    console.log('Distance', this.distance);
    console.log('From Cur : ', this.from);
    this.tab='results'
    this.current_tab = 'main_page'
    this.make_url();
    await this.callServer();
  }

  clearButton() {
    console.log('Clear button clicked');
    this.no_data_found = false;
    this.first_api_status = false;
    this.tab = 'results';
    this.product_clicked = false;
    this.data_validation = false;
    this.condition_new = false;
    this.condition_used = false;
    this.condition_unspecified = false;
    this.shipping_local = false;
    this.shipping_free = false;
    this.distance = 10;
    this.from = 'from_cur';
    this.keyword = '';
    this.category = '';
    this.manual_zip_entry = '';
    this.zip_codes = [];
    this.web_app = false;

    this.total_cart_sum = 0;
    this.last_product_status = false;
    this.last_product_dict = '';
    this.last_product_item_id = '';
    this.last_product_in_cart = '';
    this.last_product_title = '';
    this.last_product_image_url = '';
    this.last_product_shipping = '';
    this.no_data_found = false;
  }

  getImageLink(img_link: string) {
    console.log('image Link ::::::::: ', img_link);
    if (img_link === '') {
      return './assets/ebay_default.jpg';
    }
    return img_link;
  }

  async wishListProductClick(
    wish_list_product: any,
    wish_list_product_item_id: string
  ) {
    try {
        wish_list_product = this.products_in_cart_main[wish_list_product]


      const url = `${this.base_url}/search_product?item_id=${wish_list_product_item_id}`; // Construct the URL with the query parameter
      const response = await axios.get(url);
      var temp_product_details = response.data;
      temp_product_details['OneDayShipping'] =
        wish_list_product['One Day Shipping'];
      temp_product_details['Shipping Locations'] =
        wish_list_product['Shipping Locations'];
      temp_product_details['Expedited Shipping'] =
        wish_list_product['Expedited Shipping'];
      temp_product_details['Handling time'] =
        wish_list_product['Handling time'];
      temp_product_details['Shipping Cost'] =
        wish_list_product['Shipping Cost'];

        this.last_product_image_url = wish_list_product["Image"]
        this.clicked_product_image = wish_list_product["Image"]

      this.productClickDetectedFromWishList(temp_product_details);
    //   console.log(temp_product_details);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
}
