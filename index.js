const parser = require('./parser');

const linkToFireBase = "https://firebase.google.com/products/#develop-products";

/**
 * Start function
 *
 * @returns {Promise<void>}
 */
async function start() {
  try {
    const data = await parser(linkToFireBase);

    //save to JSON
    var fs = require('fs');
    const JSONdata = JSON.stringify(data, null, "  ");
    fs.writeFileSync('myjsonfile.json', JSONdata, null, 4);

    //read the file
    var info = fs.readFileSync("myjsonfile.json");
    var items = JSON.parse(info);  
    for(let item of items) {
        console.log(item.title);
        for(let block of item.blocks) {
            console.log('    -' + block.title);
        }
    }
  } catch (e) {
    console.log(e);
  }

  process.exit(0);
}

start();