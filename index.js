const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start (.+)/, (msg, [source, match]) => {

  const { chat: { id } } = msg;
  bot.sendMessage(id, match);
})