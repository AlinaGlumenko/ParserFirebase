const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');

/**
 * Function gets page content and create Cheerio object
 *
 * @param url
 * @returns {Promise<any>}
 */
async function getPage(url)
{
  return new Promise((resolve, reject) => {
    request({
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
      }
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }

      return resolve(cheerio.load(body, {decodeEntities: false}));
    });
  });
}

/**
 * Function get all ads from pages
 *
 * @param url
 * @param page
 * @returns {Promise<Array>}
 */
async function getContentFromPage(url, page)
{
  let result = [];
  const $ = await getPage(url);

  const content = $('.product-grid__product').each((i, el) => {
    result.push($(el));
  });

//   console.log(`Page ${page}: found ${content.length}`);

  return result;
}

/**
 * Function gets detailed information from ad
 *
 * @param url
 * @returns {Promise<{id: string, date: string, title: string, district: string, area: string, rooms: string, floor: string, maxFloor: string, description: string, seller:  string, photos: Array, props: Array}>}
 */
async function getDetails(url)
{
  const linkToYouTube = 'https://www.youtube.com/embed/';
  const $ = await getPage(url);
  let result = [];
  let details = {
    videoLink: '',
    blocks: []
  };

  details.videoLink = linkToYouTube + $('iframe').attr('data-video-id').trim();

  const content = $('.card__subpartial').each((i, el) => {
    result.push($(el));
  });

  for (let i = 0; i < result.length; i++) {
      let item = {
          title: '',
          descr: ''
      };

      let title = result[i].find('h4.no-link').text().trim();
      let descr = result[i].find('p').text().trim()
      if(!title || !descr) {
          continue;
      }

      item.title = title;
      item.descr = descr;
      
      details.blocks.push(item);
  }
  
  return details;
}

/**
 * Primary run function
 *
 * @param url
 * @returns {Promise<Array>}
 */
async function run(url)
{
  const result = [];
  const items = await getContentFromPage(url, 1);
  let total = items.length;
  console.log('Total content found: ' + items.length);

  for(const item of items) {
    let preData = {
        title: '',        
        platforms: '',
        descr: '',
        more: '',
        docs: ''        
    };

    preData.title = item.find('a.gc-analytics-event').attr('data-label').trim();    
    let temp = item.find('div.platform-icons__wrapper .platform-icon');
    for(let i = 0; i < temp.length; i++) {
        preData.platforms += temp[i]['attribs']['title'].trim().split(" ")[0] + (i<temp.length-1 ? '; ' : '');        
    }
    preData.descr = item.find('.product-grid__content p').text().trim();
    preData.more = url.replace("/products/#develop-products", item.find('a.cta-link').attr('href').trim());
    preData.docs = url.replace("/products/#develop-products", item.find('a.cta-link--grey').attr('href').trim());

    //Get detailed info and merge data
    const details = await getDetails(preData.more);
    allData = Object.assign(preData, details);

    result.push(allData);
  }

  return result;
}

module.exports = async function (url) {
  try {
    const data = await run(url);
    return data;
  } catch (e) {
    throw e;
  }
};