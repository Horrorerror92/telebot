const Telegraf = require('telegraf');
const config = require('config');

var moment = require('moment');

const token = config.get('token');
const portFromConfig = config.get('port');
const appUrl = config.get('appurl');
//const database = config.get('database');




const API_TOKEN = process.env.TOKEN;
const PORT = process.env.PORT;
const URL = process.env.APP_URL;

const bot = new Telegraf(API_TOKEN);
bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
bot.startWebhook(`/bot${API_TOKEN}`, null, PORT);

bot.start((ctx) => ctx.reply('Welcome'));