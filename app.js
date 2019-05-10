const http = require("https");
const dotenv = require("dotenv");
const fakturoid = require("./fakturoid");


dotenv.config();
let body = []
const auth = 'Basic ' + Buffer.from(process.env.TOGGL_API_TOKEN + ':api_token').toString('base64');
const options = {
  "method": "GET",
  "hostname": "toggl.com",
  "port": null,
  "path": `/reports/api/v2/summary?user_agent=random&workspace_id=${process.env.TOGGL_WORKSPACE_ID}&since=${process.env.TOGGL_DATE_FROM}&until=${process.env.TOGGL_DATE_TO}`,
  "headers": {
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
    "authorization": auth,
    "cache-control": "no-cache",
    
  }
};

const req = http.request(options, function (res) {
  let chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    

    body = JSON.parse(Buffer.concat(chunks).toString());
    console.log(body)
    const data = body.data[0].items.map(item => ({ name: item.title.time_entry, quantity: (item.time/(3600000)).toString(), unit_name: "hod", unit_price: process.env.FAKTUROID_UNIT_PRICE}))
    fakturoid.postInvoiceToFakturoid(data, process.env.FAKTUROID_INVOICE_NUMBER? process.env.FAKTUROID_INVOICE_NUMBER : fakturoid.getInvoiceNumberFromFakturoid);
    
  });
});

req.end();


