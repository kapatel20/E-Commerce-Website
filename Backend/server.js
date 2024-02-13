const express = require('express');
const axios = require('axios');
const querystring = require('querystring'); // Import the querystring module
const cors = require("cors")
const btoa = require('btoa');
const { MongoClient } = require('mongodb');
const path = require("path")

const mongo_url = "mongodb+srv://kapatel20:kapatel20-ebay-wishlist@ebay-wishlist.vu9ydgu.mongodb.net/?retryWrites=true&w=majority"
const mongo_client = new MongoClient(mongo_url);
const dbName = "my_db";
const collectionName = "my_collection";

async function connectToMongoDB() {
    try {
      await mongo_client.connect();
      console.log('Connected to the database');
      return mongo_client.db('my_db').collection('my_collection_1');
    } catch (err) {
      console.error(err);
    }
  }

async function insertData(data) {
    var flag = false
    try {
      const collection = await connectToMongoDB();
      await collection.insertOne(data);
      console.log('Data inserted successfully');
      flag=true
    } 
    catch (err) {
      console.error(err);
    }
    return flag
}
async function deleteData(id) {
    var flag = false
    
    try {
      const collection = await connectToMongoDB();
      await collection.deleteMany({ 'ItemID': id });
      console.log('Data deleted successfully');
      flag=true
    } catch (err) {
      console.error(err);
    }
    return flag
}

async function deleteAllData()
{
    try{
        const collection = await connectToMongoDB();
        await collection.deleteMany({});
        console.log("Deleted All Data")
    }
    catch(error)
    {
        console.log(error)
    }
}

async function getAllDocuments() {
    try {
     
      const collection = await connectToMongoDB();
  
      const cursor = collection.find({});
      const documents = await cursor.toArray();
      return documents
    } catch(error)
    {
        console.log(error);
        
    }
    return []
  }


class OAuthToken {
    constructor(client_id, client_secret) {
        this.client_id = client_id;
        this.client_secret = client_secret;
    }

    getBase64Encoding() {
        const credentials = `${this.client_id}:${this.client_secret}`;
        const base64String = btoa(credentials);
        return base64String;
    }

    async getApplicationToken() {
        const url = 'https://api.ebay.com/identity/v1/oauth2/token';

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${this.getBase64Encoding()}`
        };

        const data = new URLSearchParams();
        data.append('grant_type', 'client_credentials');
        data.append('scope', 'https://api.ebay.com/oauth/api_scope');

        try {
            const response = await axios.post(url, data, { headers });
            return response.data.access_token;
        } catch (error) {
            console.error('Error obtaining access token:', error);
            throw error;
        }
    }
}


const app = express();
app.use(cors())

app.use(express.static(path.join(__dirname, "frontend/dist/frontend/")));

app.all("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
  });



function prepareFirstAPIOutput(first_api_output)
{
    var final_first_api_json = {}
    
    if(Number(first_api_output["findItemsAdvancedResponse"][0]["searchResult"][0]["@count"])===0)
    {
        return final_first_api_json["count"]=0
    }
    final_first_api_json["count"] = first_api_output["findItemsAdvancedResponse"][0]["searchResult"][0]["@count"]
    for(let i=0;i<first_api_output["findItemsAdvancedResponse"][0]["searchResult"][0]["item"].length;i++)
    {
        var result = first_api_output["findItemsAdvancedResponse"][0]["searchResult"][0]["item"][i]
        final_first_api_json["result_"+(i+1).toString()] = {
            "Sr No":i+1,
            "ItemID":"",
            "Image":"",
            "Title":"",
            "Category":"",
            "itemURL":"",
            "Condition":"",
            "Price":"",
            "Zip":"",
            "Price":"",
            "Location":"",
            "Shipping Cost":"",
            "Shipping Locations":"",
            "Handling time":"",
            "Expedited Shipping":"",
            "One Day Shipping":""
            // "Return Accepted":""
        }
        if ("itemId" in result) {
            final_first_api_json["result_" + (i + 1)]["ItemID"] = result["itemId"][0];
        }
        if ("title" in result) {
            final_first_api_json["result_" + (i + 1)]["Title"] = result["title"];
        }
        if ("primaryCategory" in result && result["primaryCategory"].length > 0 && "categoryName" in result["primaryCategory"][0]) {
            final_first_api_json["result_" + (i + 1)]["Category"] = result["primaryCategory"][0]["categoryName"][0];
        }
        if ("viewItemURL" in result) {
            final_first_api_json["result_" + (i + 1)]["itemURL"] = result["viewItemURL"][0];
        }
        if ("galleryURL" in result && result["galleryURL"].length > 0) {
            final_first_api_json["result_" + (i + 1)]["Image"] = result["galleryURL"][0];
        }
        if ("condition" in result && result["condition"].length > 0 && "conditionDisplayName" in result["condition"][0] && result["condition"][0]["conditionDisplayName"].length > 0) {
            final_first_api_json["result_" + (i + 1)]["Condition"] = result["condition"][0]["conditionDisplayName"][0];
        }
        
        if ("postalCode" in result) {
            final_first_api_json["result_" + (i + 1)]["Zip"] = result["postalCode"][0];
        }

        if("sellingStatus" in result && result["sellingStatus"].length>0)
        {
            if("convertedCurrentPrice" in result["sellingStatus"][0] && result["sellingStatus"][0]["convertedCurrentPrice"].length>0)
            {
                final_first_api_json["result_" + (i + 1)]["Price"] = result["sellingStatus"][0]["convertedCurrentPrice"][0]["__value__"]
            }
        }
        if("location" in result && result["location"].length>0)
        {
            final_first_api_json["result_" + (i + 1)]["Location"] = result["location"][0]
        }

        if ("topRatedListing" in result) {
            final_first_api_json["result_" + (i + 1)]["top_rated"] = result["topRatedListing"][0];
        }

        if("shippingInfo" in result && result["shippingInfo"].length>0 && ("shippingServiceCost" in result["shippingInfo"][0]) && (result["shippingInfo"][0]["shippingServiceCost"].length>0))
        {
            final_first_api_json["result_" + (i + 1)]["Shipping Cost"] = result["shippingInfo"][0]["shippingServiceCost"][0]["__value__"];  
            if(final_first_api_json["result_" + (i + 1)]["Shipping Cost"]==="0.0")
            {
                final_first_api_json["result_" + (i + 1)]["Shipping Cost"] = "Free Shipping"
            }
            else if(final_first_api_json["result_" + (i + 1)]["Shipping Cost"]==="")
            {
                final_first_api_json["result_" + (i + 1)]["Shipping Cost"] = "N/A"
            } 
            else
            {
                final_first_api_json["result_" + (i + 1)]["Shipping Cost"] = final_first_api_json["result_" + (i + 1)]["Shipping Cost"].toString() + " $"
            }
        }
        
        if("shippingInfo" in result && result["shippingInfo"].length>0 && ("shipToLocations" in result["shippingInfo"][0]) && (result["shippingInfo"][0]["shipToLocations"].length>0))
        {
            final_first_api_json["result_" + (i + 1)]["Shipping Locations"] = result["shippingInfo"][0]["shipToLocations"].join(",");   
        }

        if("shippingInfo" in result && result["shippingInfo"].length>0 && ("handlingTime" in result["shippingInfo"][0]) && (result["shippingInfo"][0]["handlingTime"].length>0))
        {
            final_first_api_json["result_" + (i + 1)]["Handling time"] = result["shippingInfo"][0]["handlingTime"][0];   
        }
        
        if("shippingInfo" in result && result["shippingInfo"].length>0 && ("expeditedShipping" in result["shippingInfo"][0]) && (result["shippingInfo"][0]["expeditedShipping"].length>0))
        {
            final_first_api_json["result_" + (i + 1)]["Expedited Shipping"] = result["shippingInfo"][0]["expeditedShipping"][0];   
        }
        if("shippingInfo" in result && result["shippingInfo"].length>0 && ("oneDayShippingAvailable" in result["shippingInfo"][0]) )
        {
            final_first_api_json["result_" + (i + 1)]["One Day Shipping"] = result["shippingInfo"][0]["oneDayShippingAvailable"][0];   
        }
    }
    return final_first_api_json;
}

function prepare_product_json(product_dict, item_id)
{
    var final_product_json = {}
    final_product_json["ItemID"] = item_id
    final_product_json["Title"] = product_dict["Title"]
    final_product_json["ItemURL"] = product_dict["ViewItemURLForNaturalSearch"]
    final_product_json["Product Images"] = product_dict["PictureURL"]
    final_product_json["Location"] = product_dict["Location"]
    final_product_json["Price"] = product_dict["ConvertedCurrentPrice"]["Value"]
    final_product_json["Return Policy (US)"] = ""
    if(product_dict["ReturnPolicy"]["ReturnsAccepted"] === "ReturnsNotAccepted")
    {
        final_product_json["Return Policy (US)"] = "Returns Not Accepted"
        final_product_json["Returns Accepted"] = "false"
    }
    else
    {
        final_product_json["Return Policy (US)"] = "Returns Accepted within "+product_dict["ReturnPolicy"]["ReturnsWithin"] 
        final_product_json["Returns Accepted"] = "true"
    }
    final_product_json["Feedback Score"] = product_dict["Seller"]["FeedbackScore"]
    final_product_json["Popularity"] = product_dict["Seller"]["PositiveFeedbackPercent"]
    final_product_json["Top Rated"] = product_dict["Seller"]["TopRatedSeller"]
    final_product_json["Feedback Rating Star"] = product_dict["Seller"]["FeedbackRatingStar"]
    final_product_json["store_details_available"] = "false"
    final_product_json["store_display_name"] = product_dict["Seller"]["UserID"]
    if("Storefront" in product_dict)
    {
        final_product_json["store_details_available"] = "true"
        final_product_json["Store Name"] = product_dict["Storefront"]["StoreName"]
        final_product_json["store_link"] = product_dict["Storefront"]["StoreURL"]
    }
    
    
    
    
    final_product_json["Item Specifics"] = product_dict["ItemSpecifics"]["NameValueList"]
    
    return final_product_json
}

function prepare_similar_products_json(product_list)
{
    var similar_products_dict = {"count":product_list.length, "products_array":[]}
    for(let i=0;i<product_list.length;i++)
    {
        var temp = {}
        temp["Product Name"] = product_list[i]["title"]
        temp["item_url"] = ""
        if("viewItemURL" in product_list[i])
        {
            temp["item_url"] = product_list[i]["viewItemURL"]
        }
        temp["image"] = product_list[i]["imageURL"]
        temp["Price"] = "$"+product_list[i]["buyItNowPrice"]["__value__"]
        temp["Shipping Cost"] = "$"+product_list[i]["shippingCost"]["__value__"]
        var firstIndex = product_list[i]["timeLeft"].indexOf('P');
        var secondIndex = product_list[i]["timeLeft"].indexOf('D');
        var temp_days = product_list[i]["timeLeft"].substring(firstIndex + 1, secondIndex);
        temp["Days Left"] = Number(temp_days)
        temp["item_id"] = product_list[i]["itemId"]
        similar_products_dict["products_array"].push(temp)
    }
    
    return similar_products_dict
}

app.get('/add_to_cart', async (req, res) => {
    console.log("Adding product to cart : ", req.query.item_id)
    
    var flag = false
    try {
        const add_product = await insertData(req.query)
        flag = add_product
    } catch (error) {
        console.log(error)
        flag = false
    }
    res.json({"status":flag})
});

app.get('/delete_from_cart', async (req, res) => {
    console.log("Deleting product from cart : ", req.query.item_id)
    
    var flag = false
    try {
        const delete_product = await deleteData(req.query.item_id)
        flag = delete_product
        
    } catch (error) {
        console.log(error)
        flag = false
    }
    res.json({"status":flag})
});

app.get('/get_documents', async (req, res) => {
    console.log("Getting all documents : ")
    var docs = {}
    try {
        const documents = await getAllDocuments()
        docs = documents
        
    } catch (error) {
        console.log(error)
    }
    res.json(docs)
});

app.get('/get_documents_ids', async (req, res) => {
    console.log("Getting all documents : ")
    var docs = {}
    try {
        const documents = await getAllDocuments()
        // console.log(documents)
        documents.forEach(function(doc){
            docs[doc['ItemID']] = true
        })
        
    } catch (error) {
        console.log(error)
    }
    res.json(docs)
});

app.get('/get_images', async (req, res) => {
    console.log("Getting Images : ")
    api_key = "AIzaSyD2PHT1SfD0ypVwIYfBJD9TyHyou2wYXbI"
    search_engine_id = "25b39cd2c3f4640af"
    
    try {
        // const queryString = querystring.stringify(req.query);
        const url = `https://www.googleapis.com/customsearch/v1?q=${req.query.title}&cx=${search_engine_id}&imgSize=huge&num=8&searchType=image&key=${api_key}`;
        const response = await axios.get(url);
        const imageLinks = response.data.items.map(item => item.link);
        res.json(imageLinks);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/get_similar_products', async (req, res) => {
    client_id = "KshitijA-hw2-PRD-694557f6d-81ddebc1"
    
    try {
        const url = `https://svcs.ebay.com/MerchandisingService?OPERATION-NAME=getSimilarItems&SERVICE-NAME=MerchandisingService&SERVICE-VERSION=1.1.0&CONSUMER-ID=${client_id}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&itemId=${req.query.item_id}&maxResults=20`;
        const response = await axios.get(url);
        res.json(prepare_similar_products_json(response.data["getSimilarItemsResponse"]["itemRecommendations"]["item"]));
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/search_product', async (req, res) => {
    console.log("From Server for product detail : ")
    client_id = "KshitijA-hw2-PRD-694557f6d-81ddebc1"
    client_secret = "PRD-94557f6d9f4a-06cb-4ae0-a392-076f"
    const oauthToken = new OAuthToken(client_id, client_secret);
    
    try {
        const queryString = querystring.stringify(req.query);
        // console.log(req.query)
        const url = `https://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=KshitijA-hw2-PRD-694557f6d-81ddebc1&siteid=0&version=967&ItemID=${req.query.item_id}&IncludeSelector=Description,Details,ItemSpecifics,ShippingCosts,ShippingDetails`;
        token = await oauthToken.getApplicationToken()
    
        var config = {
            method:'get',
            url:url,
            headers:{
                "X-EBAY-API-IAF-TOKEN":token    
            }
        }
        const response = await axios.request(config)
        const data = response.data;
        // console.log(data["Item"])
        res.json(prepare_product_json(data["Item"], req.query.item_id))
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


function getPostCodes(json_dict)
{
    var postal_codes = {"zipCodes":[]}
    for(let i=0;i<json_dict.length;i++)
    {
        postal_codes["zipCodes"].push(json_dict[i]["postalCode"])
    }
    return postal_codes
}

app.get('/get_zip_codes', async (req, res) => {
    console.log("Getting Zip Codes : ")
    try {
        const url = `http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith=${req.query.starts_with}&maxRows=5&username=patelksh&country=US`;
        const response = await axios.get(url);
        const data = response.data;
        res.json(getPostCodes(data["postalCodes"])); 
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/search', async (req, res) => {
    console.log("From Server : ")
    try {
        const queryString = querystring.stringify(req.query);
        
        const url = `https://svcs.ebay.com/services/search/FindingService/v1?${queryString}`;
        const response = await axios.get(url);
        const data = response.data;
        res.json(prepareFirstAPIOutput(data)); 
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontent/dist/frontend/index.html"));
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
