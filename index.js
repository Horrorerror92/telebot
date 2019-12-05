

const TOKEN = process.env.TOKEN || '997025459:AAEjEzITgsSEwZP6wr8k-6fymLVWY4LVDi8';
const TelegramBot = require('node-telegram-bot-api');
const options = {
  webHook: {
    port: process.env.PORT || 5000
  }
};

const url = process.env.APP_URL || 'https://expenses-telebot.herokuapp.com:443';
const bot = new TelegramBot(TOKEN, options);

bot.setWebHook(`${url}/bot${TOKEN}`);


// Just to ping!
bot.onText(/\/start/, function (msg, match) {
  var fromId = msg.from.id;
  bot.sendMessage(fromId, " Введите логин:");

});