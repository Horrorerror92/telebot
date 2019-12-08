const config = require('config');
const { Client } = require('pg');

const token = config.get('token');
const portFromConfig = config.get('port');
const appUrl = config.get('appurl');
const database = config.get('database');

const TOKEN = process.env.TOKEN;
const TelegramBot = require('node-telegram-bot-api');
const options = {
  webHook: {
    port: process.env.PORT
  }
};

const url = process.env.APP_URL;
const bot = new TelegramBot(TOKEN, options);
//const bot = new TelegramBot(TOKEN, { polling: true });

bot.setWebHook(`${url}/bot${TOKEN}`);

var specialState = 0;


bot.onText(/\/start/, function (msg, match) {

  let passData = [];
  var fromId = msg.from.id;
  initStart(fromId, passData);

});

function initStart(fromId, passData) {

  bot.sendMessage(fromId, "Введите логинs:");
  console.log("specialState" + specialState);

  if (specialState == 0) {

    bot.on('message', (msg) => {


      if (msg.text && passData.length < 2) {

        if (passData.length < 1) {
          bot.sendMessage(fromId, " Введите пароль:");

        }

        passData.push(msg.text);
      }
      if (passData.length == 2 && specialState == 0) {

        console.log("specialState +" + specialState);
        let valueLogin = passData[0];
        let valuePass = passData[1];

        getRightData(valueLogin, valuePass, function (result) {

          console.log(result.length);
          if (result.length == 0) {
            bot.sendMessage(fromId, " Неправильный логин и/или пароль!");

          } else if (result.length != 0 && result.length != undefined) {

            bot.sendMessage(fromId, " Авторизация прошла успешно!",
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "Текущий баланс",
                        callback_data: result[0] + 'balance'
                      },
                      {
                        text: "Создать карточку",
                        callback_data: result[0] + 'createCard'
                      }
                    ]
                  ]
                }
              });
          }

        });

      }
    });

  }
}

bot.on('callback_query', query => {

  const id = query.message.chat.id;
  console.log(query);
  console.log(query.data);
  var coincidence = query.data.substring(18);

  if (coincidence.toUpperCase() === 'BALANCE') {

    var userId = query.data.substring(0, 18);
    getBalance(userId, function (result) {

      bot.sendMessage(id, `Текущий баланс ${result} $`);

    });

  }

  if (coincidence.toUpperCase() === 'CREATECARD') {

    var userId = query.data.substring(0, 18);

    bot.sendMessage(id, "На какой день желаете создать карточку?",
      {

        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Сегодня",
                callback_data: userId + 'createToday'
              },
              {
                text: "Календарь",
                callback_data: userId + 'openСalendar'
              },
              {
                text: "Отмена",
                callback_data: userId + 'Auth'
              },

            ]
          ]
        }

      });
  }
  if (coincidence.toUpperCase() === 'CREATETODAY') {

    specialState = 1;
    var userId = query.data.substring(0, 18);
    console.log(query.data);
    bot.sendMessage(id, "Amount:");
    var ArrPush = [];
    bot.on('message', (msg) => {
      if (msg.text && ArrPush.length < 2) {

        if (ArrPush.length < 1) {
          bot.sendMessage(id, " Desc:");
        }

        ArrPush.push(msg.text);
      }
      if (ArrPush.length == 2) {

        ArrPush.push(userId);
        console.log(ArrPush);

        let Amount = ArrPush[0];
        let Description = ArrPush[1];
        let UserId = ArrPush[2];

        var date = new Date().toUTCString();

        setCard(Amount, Description, UserId, date, function (result) {
          console.log(result);
          bot.sendMessage(id, " Готово");
        })

      }


    });
  }
  if (coincidence.toUpperCase() === 'OPENСALENDAR') {
    console.log(query.data);
    bot.sendMessage(id, "календарь");

  }
  if (coincidence.toUpperCase() === 'AUTH') {
    console.log(query.data);

    var userId = query.data.substring(0, 18);

    bot.sendMessage(id, " Авторизация прошла успешно!",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Текущий баланс",
                callback_data: userId + 'balance'
              },
              {
                text: "Создать карточку",
                callback_data: userId + 'createCard'
              }
            ]
          ]
        }
      });
  }
});

function getRightData(valueLogin, valuePass, dataCallback) {

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });

  client.connect();

  client.query(`SELECT sfid,email,password__c,office__c FROM salesforce.contact WHERE email = '${valueLogin}'
  AND password__c = '${valuePass}';`, (err, res) => {

    if (err) {
      client.end();
      return dataCallback(new Error(err));
    }
    var tempArr = [];
    if (res.rows.length == 0) {
      dataCallback(new Error('произошла ошибка'));
      client.end();
      return dataCallback(tempArr);

    } else {
      for (let [keys, values] of Object.entries(res.rows)) {

        for (let [key, value] of Object.entries(values)) {
          tempArr.push(value);

        }
      }
      client.end();
      return dataCallback(tempArr);
    }

  });
}

function getBalance(valueId, balanceCallback) {

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });

  client.connect();

  client.query(`SELECT sfid, Reminder__c, Keeper__c FROM salesforce.MonthlyExpense__c WHERE
  Keeper__c = '${valueId}';`, (err, res) => {

    tempArr = [];

    if (err) {
      client.end();
      return balanceCallback(new Error(err));
    }

    if (res.rows.length == 0) {
      balanceCallback(new Error('произошла ошибка'));
      client.end();
      return balanceCallback(res.rows);

    } else {
      for (let [keys, values] of Object.entries(res.rows)) {

        for (let [key, value] of Object.entries(values)) {
          if (key.toUpperCase() === 'REMINDER__C') {
            tempArr.push(value);
          }

        }

      }
      const reducer = (accumulator, currentValue) => accumulator + currentValue;
      var totalAmount = tempArr.reduce(reducer);
      client.end();
      return balanceCallback(totalAmount);
    }
  });

}

function setCard(Amount, Description, userId, cardDate, statusCallback) {


  var parsedAmount = parseFloat(Amount, 10);
  const MONTHLYFAKE = 'a012w000000VhXsAAK';


  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });

  client.connect();

  client.query(`INSERT INTO salesforce.expensecard__c
  (Name, Amount__c, CardKeeper__c, CardDate__c,Description__c,MonthlyExpense__c)
  VALUES('${userId}', ${parsedAmount}, '${userId}', '${cardDate}', '${Description}', '${MONTHLYFAKE}');`, (err, res) => {

    if (err) {
      client.end();
      return statusCallback(new Error(err));
    } else {

      client.end();
      return statusCallback(res);

    }

  });

}

// getCard(function (result) {
//   console.log(result);
// })

// function getCard(balanceCallback) {

//   const client = new Client({
//     connectionString: process.env.DATABASE_URL || database,
//     ssl: true
//   });

//   client.connect();

//   client.query(`SELECT sfid, Name, Amount__c,CardKeeper__c, CardDate__c, Description__c,MonthlyExpense__c
//     FROM salesforce.expensecard__c ;`, (err, res) => {

//     tempArr = [];

//     if (err) {
//       client.end();
//       return balanceCallback(new Error(err));
//     }

//     if (res.rows.length == 0) {
//       balanceCallback(new Error('произошла ошибка'));
//       client.end();
//       return balanceCallback(res.rows);

//     } else {
//       for (let [keys, values] of Object.entries(res.rows)) {

//         for (let [key, value] of Object.entries(values)) {

//           tempArr.push(value);

//         }

//       }
//       client.end();
//       return balanceCallback(res.rows);
//     }
//   });

// }


//bot.on("polling_error", (err) => console.log(err));



