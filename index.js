const config = require('config');
const { Client } = require('pg');

const token = config.get('token');
const portFromConfig = config.get('port');
const appUrl = config.get('appurl');
const database = config.get('database');

const TOKEN = process.env.TOKEN || token;
const TelegramBot = require('node-telegram-bot-api');
const options = {
  webHook: {
    port: process.env.PORT || portFromConfig
  }
};

const client = new Client({
  connectionString: process.env.DATABASE_URL || database,
  ssl: true
});

const url = process.env.APP_URL || appUrl;
const bot = new TelegramBot(TOKEN, options);
//const bot = new TelegramBot(TOKEN, { polling: true });

bot.setWebHook(`${url}/bot${TOKEN}`);

let passData = [];
let success = undefined;

var userState = new Object();
userState.currentStep = 0;


bot.onText(/\/start/, function (msg, match) {
  if (userState.currentStep == 0) {
    console.log("/start before" + userState.currentStep);
    userState.currentStep = 1;
    var fromId = msg.from.id;
    initStart(fromId);
  } else {

    console.log(userState.currentStep);

    var fromId = msg.from.id;
    bot.sendMessage(fromId, "Не работает:");
  }

});

function initStart(fromId) {

  if (userState.currentStep == 1) {

    bot.sendMessage(fromId, "Введите логинs:");
    console.log(" before login" + userState.currentStep);
    userState.currentStep = 2;
  }

  bot.on('message', (msg) => {
    console.log(" before before" + userState.currentStep);
    if (userState.currentStep == 2) {

      console.log(" before pass" + userState.currentStep);

      if (msg.text && passData.length < 2) {

        if (passData.length < 1) {
          bot.sendMessage(fromId, " Введите пароль:");
          userState.currentStep == 3;
          console.log(userState.currentStep);
        }

        passData.push(msg.text);
      }
      if (passData.length == 2 && userState.currentStep == 3) {

        console.log(userState.currentStep);

        let valueLogin = passData[0];
        let valuePass = passData[1];

        getRightData(valueLogin, valuePass, function (result) {


          if (result.length != 0) {
            bot.sendMessage(fromId, " Неправильный логин и/или пароль!");
            userState.currentStep = 0;
            console.log(userState.currentStep);

          } else {

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

        });

      }
    }
  });

}

bot.on('callback_query', query => {

  const id = query.message.chat.id;
  console.log(query);
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


function getRightData(valueLogin, valuePass, dataCallback) {

  client.connect();

  client.query(`SELECT sfid,email,password__c,office__c FROM salesforce.contact WHERE email = '${valueLogin}'
  AND password__c = '${valuePass}';`, (err, res) => {

    if (err) throw err;

    var tempArr = [];
    if (res.rows.length == 0) {
      dataCallback(new Error('произошла ошибка'));
      return dataCallback(tempArr);

    } else {
      for (let [keys, values] of Object.entries(res.rows)) {

        for (let [key, value] of Object.entries(values)) {
          tempArr.push(value);

        }
      }
      if (tempArr == 0 || err) {
        dataCallback(new Error('произошла ошибка'));
      } else {
        return dataCallback(tempArr);
      }

    }



  });

}

getRightData('adminadmin@testsc.org', 'admin', function (result) {

  console.log(result);

});






