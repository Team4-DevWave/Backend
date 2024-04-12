const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const catchasync = require('../utils/catchasync');

exports.trending = catchasync(async (req, res, next) => {
  puppeteer.use(StealthPlugin());

  const baseURL = `https://trends.google.com`;
  const countryCode = 'US';

  async function fillTrendsDataFromPage(page) { // eslint-disable-line
    const isNextPage = await page.$('.feed-load-more-button');
    if (isNextPage) {
      await page.click('.feed-load-more-button');
      await page.waitForTimeout(2000);
    }
    const dataFromPage = await page.evaluate((baseURL) => {
      return Array.from(document.querySelectorAll('.feed-list-wrapper')).map((el) => ({
        [el.querySelector('.content-header-title').textContent.trim()]: Array.from(el.querySelectorAll('feed-item')).map((el) => ({
          index: el.querySelector('.index')?.textContent.trim(),
          title: el.querySelector('.title a')?.textContent.trim(),
          titleLink: `${baseURL}${el.querySelector('.title a')?.getAttribute('href')}`,
          subtitle: el.querySelector('.summary-text a')?.textContent.trim(),
          subtitleLink: el.querySelector('.summary-text a')?.getAttribute('href'),
          source: el.querySelector('.source-and-time span:first-child')?.textContent.trim(),
          published: el.querySelector('.source-and-time span:last-child')?.textContent.trim(),
          searches: el.querySelector('.search-count-title')?.textContent.trim(),
          thumbnail: el.getAttribute('image-url'),
        })),
      }));
    }, baseURL);
    return dataFromPage;
  }

  async function getGoogleTrendsDailyResults() { // eslint-disable-line
    const browser = await puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,700'],
    });

    const page = await browser.newPage();
    page.setViewport({width: 1200, height: 700});

    const URL = `${baseURL}/trends/trendingsearches/daily?geo=${countryCode}&hl=en`;

    await page.setDefaultNavigationTimeout(60000);
    await page.goto(URL);

    await page.waitForSelector('.feed-item');

    const dailyResults = await fillTrendsDataFromPage(page);

    await browser.close();

    return dailyResults;
  }

  const today = new Date(); // Get today's date
  const options = {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'};
  let formattedDate = today.toLocaleDateString('en-US', options);

  getGoogleTrendsDailyResults().then((result) => {
    const todayTrends = result[0];
    const allTrends = todayTrends[formattedDate];
    let trends = allTrends.slice(0, 6).map((trend) => ({
      title: trend.title,
      subtitle: trend.subtitle,
    }));
    if (trends.length < 6) {
      const remaining = 6 - trends.length;
      const yesterdayTrends = result[1];
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const options = {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'};
      formattedDate = yesterday.toLocaleDateString('en-US', options);
      const remainingTrends = yesterdayTrends[formattedDate];
      const restOfTrends = remainingTrends.slice(0, remaining).map((trend) => ({
        title: trend.title,
        subtitle: trend.subtitle,
      }));
      trends = [...trends, ...restOfTrends]; // Merge the two arrays
    }
    res.status(200).json({
      status: 'success',
      data: {
        trends,
      },
    });
  });
});
