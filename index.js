const TelegramBot = require('node-telegram-bot-api');
const config = require('config');

const TOKEN = config.get('token');

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start (.+)/, (msg, [source, match]) => {

  const { chat: { id } } = msg;
  bot.sendMessage(id, match);
})