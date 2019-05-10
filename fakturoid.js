var http = require("https");
const dotenv = require("dotenv");
dotenv.config();


const today = new Date().toISOString().split('T')[0]
var options = {
  post: {
  "method": "POST",
  "hostname": "app.fakturoid.cz",
  "port": null,
  "path": `/api/v2/accounts/${process.env.FAKTUROID_SLUG}/invoices.json`,
  "headers": {
    "content-type": "application/json",
    "user-agent": process.env.FAKTUROID_EMAIL,
    "authorization": 'Basic ' + Buffer.from(process.env.FAKTUROID_EMAIL +":"+ process.env.FAKTUROID_API_KEY).toString('base64'),
    "cache-control": "no-cache",
  }
},
  get:{
    "method": "GET",
    "hostname": "app.fakturoid.cz",
    "port": null,
    "path": `/api/v2/accounts/${process.env.FAKTUROID_SLUG}/invoices.json`,
    "headers": {
      "content-type": "application/json",
      "user-agent": process.env.FAKTUROID_EMAIL,
      "authorization": 'Basic ' + Buffer.from(process.env.FAKTUROID_EMAIL +":"+ process.env.FAKTUROID_API_KEY).toString('base64'),
      "cache-control": "no-cache",
    }

}
};

const getInvoiceNumberFromFakturoid = () => {
  var req = http.request(options.get, function (res, data) {
    var chunks = [];
  
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res.on("end", function () {
      var body = JSON.parse(Buffer.concat(chunks).toString());
      
      if(!body.errors){
        return (parseInt(body[0].number.str.replace("-", "."))+0.0001).replace(".", "-");
      }
      else{
        console.error(body.errors);
        throw error(body.error);
      }
      

    });
  });
}

const postInvoiceToFakturoid = (data, invoice_number) => {

  var req = http.request(options.post, function (res, data) {
    var chunks = [];
  
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res.on("end", function () {
      var body = JSON.parse(Buffer.concat(chunks).toString());
      
      if(!body.errors){
        console.clear();
        console.log("Faktura uspesne nahrana");
        console.log();
        console.log("LINK NA FAKTURU", body.html_url);
        console.log("PUBLIC LINK NA FAKTURU", body.public_html_url);
        console.log("PDF KE STAZENI", body.html_url+".pdf=download=true");
      }
      else{
        console.error(body.errors);
      }
      

    });
  });

  req.write(JSON.stringify({ custom_id: invoice_number,
    subject_id: process.env.FAKTUROID_SUBJECT_ID,
    number: invoice_number,
    currency: 'CZK',
    payment_method: process.env.FAKTUROID_PAYMENT_METHOD.toString(),
    due: process.env.FAKTUROID_PAYMENT_DUE,
    issued_on: process.env.FAKTUROID_ISSUED_ON? process.env.FAKTUROID_ISSUED_ON: today,
    //taxable_fulfillment_due: '2012-03-30',
    bank_account_id: 7,
    lines: data 
  }));
  req.end();
  

}

module.exports.postInvoiceToFakturoid = postInvoiceToFakturoid;
module.exports.getInvoiceNumberFromFakturoid = getInvoiceNumberFromFakturoid;