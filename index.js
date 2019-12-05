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

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});


client.connect();

client.query('SELECT sfid,email,password__c,office__c FROM salesforce.contact;', (err, res) => {
  if (err) throw err;
  var count = 0;
  for (let row of res.rows) {

    console.log(JSON.stringify(row));
  }

  client.end();
});


// Just to ping!
bot.onText(/\/start/, function (msg, match) {
  var fromId = msg.from.id;
  bot.sendMessage(fromId, " Введите логин!:");

});