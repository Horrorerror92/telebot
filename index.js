const TelegramBot = require('node-telegram-bot-api');

const TOKEN = "997025459:AAEjEzITgsSEwZP6wr8k-6fymLVWY4LVDi8";

const bot = new TelegramBot(TOKEN, { polling: true });


bot.onText(/\/start/, function (msg, match) {
  var fromId = msg.from.id;
  bot.sendMessage(fromId, " Введите логин:");

});