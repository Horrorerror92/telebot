const Telegraf = require('telegraf');
const config = require('config');

//var moment = require('moment');

//const token = config.get('token');
//const portFromConfig = config.get('port');
//const appUrl = config.get('appurl');
//const database = config.get('database');

const token = "997025459:AAEjEzITgsSEwZP6wr8k-6fymLVWY4LVDi8";
const port = "4444";
const appurl = "https://expenses-telebot.herokuapp.com:443";


const API_TOKEN = process.env.TOKEN || token;
const PORT = process.env.PORT || port;
const URL = process.env.APP_URL || appurl;

const bot = new Telegraf(API_TOKEN);
bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
bot.startWebhook(`/bot${API_TOKEN}`, null, PORT);

bot.start((ctx) => ctx.reply('Welcome'));