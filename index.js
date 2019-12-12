//

//const token = config.get('token');
//const portFromConfig = config.get('port');

//const database = config.get('database');

//In web Hoook
const token = "997025459:AAEjEzITgsSEwZP6wr8k-6fymLVWY4LVDi8";
const port = "5010";
const appurl = "https://expenses-telebot.herokuapp.com:443";
const database = "postgres://nompkhkmnxkser:4bb77550324c86b7e95993a349c671b6fac89104c06c0eddfb0fa69af6846965@ec2-54-246-92-116.eu-west-1.compute.amazonaws.com:5432/d6k22t3snu90ec"

const API_TOKEN = process.env.TOKEN || token;
const PORT = process.env.PORT || port;
const URL = process.env.APP_URL || appurl;

///////////////////////// Uncomment before final stage

const Telegraf = require('telegraf');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const WizardScene = require('telegraf/scenes/wizard');
const config = require('config');
const { Client } = require('pg');
//const database = config.get('database');
const extra = require('telegraf/extra');
const Calendar = require('telegraf-calendar-telegram');
const moment = require('moment');

const ArrToLogin = [];
const ArrToCard = [];
const ArrToDate = [];

let client = new Client({
  connectionString: process.env.DATABASE_URL || database,
  ssl: true
});

const stepHandler = new Composer()
//const stepCalendar = new Composer()
// middleware between 3 and 4 ,different action
stepHandler.action('balance', async (ctx) => {

  let userId = ctx.scene.session.state.result[0]
  console.log(userId);
  const resultId = await getBalance(userId)
  console.log(resultId);
  ctx.reply(`Текущий баланс: $ ${resultId}. Для продолжения напишите что-нибудь`)

  return ctx.scene.leave()
})

stepHandler.action('createCard', (ctx) => {

  ctx.reply(`На какой день хотите создать карточку?`, createCardMsg)

  return ctx.wizard.next()
})
// middleware between 4 and 5 ,different action
// stepCalendar.action("calendarApi", (ctx) => {

//   calendarApi.setDateListener((ctx, date) => {
//     console.log(date);
//   });

//   return ctx.wizard.next()
// })

// middleware between 3 and 4 steps void
stepHandler.use((ctx) => ctx.replyWithMarkdown('Авторизация прошла успешно', successMsg))
// middleware between 4 and 5 steps void
//stepCalendar.use((ctx) => ctx.replyWithMarkdown("Выберите датуs", calendarApi.setMinDate(new Date(2015, 0, 1)).setMaxDate(new Date(2020, 12, 31)).getCalendar()))

const superWizard = new WizardScene('super-wizard',
  //1 step
  (ctx) => {
    ctx.scene.session.state = {}
    ctx.reply('Введите логин: ');
    return ctx.wizard.next()
  },
  //2 step
  (ctx) => {

    ctx.reply('Введите пароль: ');
    ArrToLogin.push(ctx.message.text);
    return ctx.wizard.next()
  },
  //3 step
  async (ctx) => {

    ArrToLogin.push(ctx.message.text);
    Login = ArrToLogin[0];
    Pass = ArrToLogin[1];
    const result = await getData(Login, Pass)
    ArrToLogin.length = 0;
    if (result.length === 4) {
      ctx.scene.session.state = {
        result: result
      }
      ctx.reply('Авторизация прошла успешно', successMsg);
      return ctx.wizard.next()
    } else if (result.length === 0) {

      ctx.reply('Неправильный логин и/или пароль, Если хотите повторить попытку,  напишите что-нибудь');
      return ctx.scene.leave()
    }
  },
  // middleware between 3 & 4 steps
  stepHandler,
  //4 step
  (ctx) => {

    let callbackData = ctx.update.callback_query.data;
    console.log(callbackData);
    ctx.scene.session.state.result.push(callbackData);

    if (callbackData.toUpperCase() === 'CANCEL') {
      ctx.reply('Авторизация прошла успешно', successMsg);
      return ctx.wizard.back()
    }
    else if (callbackData.toUpperCase() === 'TODAY') {
      ctx.reply('Что записывать в поле Amount?');
      console.log(ctx.scene.session);
      return ctx.wizard.selectStep(6)
    }
    else if (callbackData.toUpperCase() === 'CALENDAR') {

      const today = new Date();
      const minDate = new Date(2015, 0, 1);
      const maxDate = new Date(2020, 12, 31);
      ctx.reply("Выберите дату", calendarApi.setMinDate(minDate).setMaxDate(maxDate).getCalendar())
      return ctx.wizard.next()
    }


  },
  //stepCalendar,
  // 5 step
  (ctx) => {

    ctx.reply('Что записывать в поле Amount calendar?');

    console.log(ctx.update.callback_query);
    return ctx.wizard.next()

    //6 step
  }, (ctx) => {

    console.log(ctx.scene.session);
    ArrToCard.push(ctx.message.text)
    ctx.reply('Что записывать в поле Description?');
    return ctx.wizard.next()

    //7 step 
  }, (ctx) => {

    console.log(ctx.scene.session);
    ArrToCard.push(ctx.message.text)
    let userId = ctx.scene.session.state.result[0];
    let Amount = ArrToCard[0];
    let Description = ArrToCard[1];
    let cardDate = new Date().toUTCString();
    console.log(`${Amount} ${Description} ${userId} ${cardDate}`);
    setBalance(Amount, Description, userId, cardDate);
    ArrToCard.length = 0;
    ctx.reply('Спасибо, запрос будет обработан. До свидания!');
    return ctx.scene.leave()
  }

)
// client logic
const getData = async (valueLogin, valuePass) => {
  let tempArr = [];

  const result = await client
    .query(`SELECT sfid,email,password__c,office__c FROM salesforce.contact WHERE email = '${valueLogin}'
    AND password__c = '${valuePass}';`)

  for (let [keys, values] of Object.entries(result.rows)) {


    for (let [key, value] of Object.entries(values)) {
      tempArr.push(value);
    }
  }

  if (!tempArr.length) {
    tempArr.length = 0;
  }
  return tempArr;
};

const getBalance = async (valueId) => {

  let tempArr = [];

  const result = await client
    .query(`SELECT sfid, Reminder__c, Keeper__c FROM salesforce.MonthlyExpense__c WHERE
  Keeper__c = '${valueId}';`)

  for (let [keys, values] of Object.entries(result.rows)) {

    for (let [key, value] of Object.entries(values)) {
      if (key.toUpperCase() === 'REMINDER__C') {
        tempArr.push(value);
      }
    }

  }
  if (!tempArr.length) {
    totalAmount = 0;
  }
  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  var totalAmount = tempArr.reduce(reducer);

  return totalAmount;

};
// in heroku pg  - sfid is null, salesforce trigger does not work ?
const setBalance = async (Amount, Description, userId, cardDate) => {

  var parsedAmount = parseFloat(Amount, 10);
  const MONTHLYFAKE = 'a012w000000VhXsAAK';

  await client
    .query(`INSERT INTO salesforce.expensecard__c
    (Name, Amount__c, CardKeeper__c, CardDate__c,Description__c, MonthlyExpense__c, ExternalID__c)
    VALUES('${userId}', ${parsedAmount}, '${userId}', '${cardDate}', '${Description}', '${MONTHLYFAKE}', gen_random_uuid());`)
};

// app for begin

client.connect();
//const bot = new Telegraf('845500942:AAE4XZRtug6HbL3qAqqFeH2ASw93aNbYpVU')
///
const bot = new Telegraf(API_TOKEN);
bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
bot.startWebhook(`/bot${API_TOKEN}`, null, PORT);
///
const calendarApi = new Calendar(bot);
const stage = new Stage([superWizard], { default: 'super-wizard' })
bot.use(session())
bot.use(stage.middleware())

bot.launch()

const successMsg = extra
  .markdown().markup((msg) => msg.inlineKeyboard([
    msg.callbackButton('Текущий баланс', 'balance'),
    msg.callbackButton('Создать карточку', 'createCard')
  ]));

const createCardMsg = extra
  .markdown().markup((msg) => msg.inlineKeyboard([
    msg.callbackButton('Сегодня', 'today'),
    msg.callbackButton('Календарь', 'calendar'),
    msg.callbackButton('Отмена', 'cancel')
  ]));

bot.catch((err, ctx) => {
  console.log(`Ooops, ecountered an error for ${ctx.updateType}`, err)
})

