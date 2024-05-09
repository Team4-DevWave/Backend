const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const catchAsync = require('../utils/catchasync');
const subredditModel = require('../models/subredditmodel');
const AppError = require('../utils/apperror');
const postModel = require('../models/postmodel');
const commentModel = require('../models/commentsmodel');
const paginate = require('../utils/paginate');
const postutil = require('../utils/postutil');
const commentutil = require('../utils/commentutil');
const userModel = require('../models/usermodel');

exports.trending = catchAsync(async (req, res, next) => {
  puppeteer.use(StealthPlugin());  //eslint-disable-line

  const baseURL = `https://trends.google.com`;
  const countryCode = 'US';

  async function fillTrendsDataFromPage(page) { // eslint-disable-line
    const isNextPage = await page.$('.feed-load-more-button');
    if (isNextPage) {
      await page.click('.feed-load-more-button');
      await page.waitForTimeout(2000);
    }
    const dataFromPage = await page.evaluate((baseURL) => {
      return Array.from(document.querySelectorAll('.feed-list-wrapper')).map((el) => ({   //eslint-disable-line
        [el.querySelector('.content-header-title').textContent.trim()]: Array.from(el.querySelectorAll('feed-item')).map((el) => ({   //eslint-disable-line
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
    let trends = [];
    let allTrends = [];
    if (Object.prototype.hasOwnProperty.call(todayTrends, formattedDate)) {
      allTrends = todayTrends[formattedDate];
      trends = allTrends.slice(0, 6).map((trend) => ({
        title: trend.title,
        subtitle: trend.subtitle,
      }));
    } else {
      const yesterdayTrends = result[0];
      today.setDate(today.getDate() - 1);
      const options = {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'};
      formattedDate = today.toLocaleDateString('en-US', options);
      const remainingTrends = yesterdayTrends[formattedDate];
      const restOfTrends = remainingTrends.slice(0, 6).map((trend) => ({
        title: trend.title,
        subtitle: trend.subtitle,
      }));
      trends = restOfTrends;
      res.status(200).json({
        status: 'success',
        data: {
          trends,
        },
      });
      return;
    }
    allTrends = todayTrends[formattedDate];
    trends = allTrends.slice(0, 6).map((trend) => ({
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

exports.getSubredditsWithCategory = catchAsync(async (req, res, next) => {
  let subreddits = [];
  const result = [];
  if (req.body.random === false) {
    subreddits = await subredditModel.find({$and: [{category: req.body.category}, {category: {$exists: true}}]});
    if (subreddits.length !== 0) {
      for (let i = 0; i < subreddits.length; i++) {
        const subreddit = await subredditModel.findById(subreddits[i].id).select('name srLooks.icon');
        const {srLooks, ...otherProps} = subreddit._doc;    //eslint-disable-line
        result.push({
          ...otherProps,    //eslint-disable-line
          icon: srLooks.icon,
        });
      }
    } else {
      return next(new AppError('No subreddits found with that category', 404));
    }
  } else {
    const count = await subredditModel.countDocuments({category: {$exists: true, $ne: null}});
    if (count===0) return next(new AppError('No subreddits found', 404));
    const random = Math.floor(Math.random() * count);
    const subreddit = await subredditModel.findOne({category: {$exists: true, $ne: null}}).skip(random);
    subreddits = await subredditModel.find({category: subreddit.category});
    if (subreddits !== null) {
      for (let i = 0; i < subreddits.length; i++) {
        const subreddit = await subredditModel.findById(subreddits[i].id).select('name srLooks.icon');
          const {srLooks, ...otherProps} = subreddit._doc;    //eslint-disable-line
        result.push({
            ...otherProps,    //eslint-disable-line
          icon: srLooks.icon,
        });
      }
    }
  }
  res.status(200).json({
    status: 'success',
    data: {
      result,
    },
  });
});

exports.search=catchAsync(async (req, res, next)=>{
  const query='.*'+req.query.q+'.*';
  const sort= req.query.sort || 'Top'; //eslint-disable-line
  const pageNumber= req.query.page || 1;
  if (!query) {
    next(new AppError('Please provide a search query', 400));
    return;
  }
  const posts=await postModel.find({title: {$regex: query, $options: 'i'}}).exec();
  const media=await postModel.find({title: {$regex: query, $options: 'i'}, type: 'image/video'}).exec();
  const comments=await commentModel.find({content: {$regex: query, $options: 'i'}}).populate('post').exec();
  const subreddits=await subredditModel.find({name: {$regex: query, $options: 'i'}}).exec();
  const users=await userModel.find({username: {$regex: query, $options: 'i'}}).exec();
  // handling posts
  // handling comments
  // handling subreddits
  const paginatedPosts=paginate.paginate(posts, 10, pageNumber);
  const alteredPosts=await postutil.alterPosts(req, paginatedPosts);
  const paginatedComments=paginate.paginate(comments, 10, pageNumber);
  const alteredComments=await commentutil.removeSr( paginatedComments);
  const paginatedSubreddits=paginate.paginate(subreddits, 10, pageNumber);
  const paginatedMedia=paginate.paginate(media, 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts: alteredPosts,
      comments: alteredComments,
      subreddits: paginatedSubreddits,
      media: paginatedMedia,
      users,
    },
  });
});
