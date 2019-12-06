const TOKEN = process.env.TOKEN || '997025459:AAEjEzITgsSEwZP6wr8k-6fymLVWY4LVDi8';
const TelegramBot = require('node-telegram-bot-api');
const options = {
  webHook: {
    port: process.env.PORT || 5001
  }
};

const url = process.env.APP_URL || 'https://expenses-telebot.herokuapp.com:443';
const bot = new TelegramBot(TOKEN, options);

bot.setWebHook(`${url}/bot${TOKEN}`);

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://nompkhkmnxkser:4bb77550324c86b7e95993a349c671b6fac89104c06c0eddfb0fa69af6846965@ec2-54-246-92-116.eu-west-1.compute.amazonaws.com:5432/d6k22t3snu90ec',
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


let passData = [];
let success = undefined;



bot.onText(/\/start/, function (msg, match) {

  var fromId = msg.from.id;
  initStart(fromId);


});

function initStart(fromId) {

  bot.sendMessage(fromId, " Введите логин:");

  bot.on('message', (msg) => {

    if (msg.text != '/start') {

      if (msg.text && passData.length < 2) {

        if (passData.length < 1) {
          bot.sendMessage(fromId, " Введите пароль:");
        }

        passData.push(msg.text);
      }
      if (passData.length == 2) {

        //server logic
        success = true;
      }
      if (success == true) {
        bot.sendMessage(fromId, " Авторизация прошла успешно!",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Текущий баланс",
                    callback_data: 'currentBalance'
                  },
                  {
                    text: "Создать карточку",
                    callback_data: 'createCard'
                  }
                ]
              ]
            }
          });
      }
      if (success == false) {
        bot.sendMessage(fromId, " Неправильный логин и/или пароль!");
      }

    }


  });

}


bot.on('callback_query', query => {

  const id = query.message.chat.id;
  console.log(query.data);
  if (query.data.toUpperCase() === 'CURRENTBALANCE') {

    bot.sendMessage(id, "Текущий баланс $ ");

  }

  if (query.data.toUpperCase() === 'CREATECARD') {

    bot.sendMessage(id, "На какой день желаете создать карточку?",
      {

        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Сегодня",
                callback_data: 'createToday'
              },
              {
                text: "Календарь",
                callback_data: 'openСalendar'
              },
              {
                text: "Отмена",
                callback_data: 'cancel'
              },

            ]
          ]
        }

      });
  }
  if (query.data.toUpperCase() === 'CREATETODAY') {


    bot.sendMessage(id, "сегодня");


  }
  if (query.data.toUpperCase() === 'OPENСALENDAR') {

    bot.sendMessage(id, "календарь");

  }
  if (query.data.toUpperCase() === 'CANCEL') {

    bot.sendMessage(id, "Нет описания поведения \"отмены\" в задаче");

  }

});

