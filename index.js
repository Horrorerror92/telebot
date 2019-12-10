//var moment = require('moment');

//const token = config.get('token');
//const portFromConfig = config.get('port');

//const database = config.get('database');

//In web Hoook
// const token = "997025459:AAEjEzITgsSEwZP6wr8k-6fymLVWY4LVDi8";
// const port = "4444";
// const appurl = "https://expenses-telebot.herokuapp.com:443";


// const API_TOKEN = process.env.TOKEN || token;
// const PORT = process.env.PORT || port;
// const URL = process.env.APP_URL || appurl;

// const bot = new Telegraf(API_TOKEN);
// bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
// bot.startWebhook(`/bot${API_TOKEN}`, null, PORT);

/////////////////////////

const Telegraf = require('telegraf');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const WizardScene = require('telegraf/scenes/wizard');
const config = require('config');
const { Client } = require('pg');
const database = config.get('database');

const ArrToLogin = [];

let client = new Client({
  connectionString: process.env.DATABASE_URL || database,
  ssl: true
});


const superWizard = new WizardScene('super-wizard',

  (ctx) => {
    ctx.reply('Введите логин: ');
    return ctx.wizard.next()
  },

  (ctx) => {
    ctx.reply('Введите пароль: ');
    ArrToLogin.push(ctx.message.text);
    return ctx.wizard.next()
  },
  async (ctx) => {
    ArrToLogin.push(ctx.message.text);
    Login = ArrToLogin[0];
    Pass = ArrToLogin[1];

    const result = await getData(Login, Pass)
    console.log(result);
    console.log(result2);
    return ctx.scene.leave()
  },
)

const bot = new Telegraf('845500942:AAE4XZRtug6HbL3qAqqFeH2ASw93aNbYpVU')
const stage = new Stage([superWizard], { default: 'super-wizard' })
bot.use(session())
bot.use(stage.middleware())
bot.launch()

const getData = async (valueLogin, valuePass) => {
  let tempArr = [];

  await client.connect();
  const result = await client
    .query(`SELECT sfid,email,password__c,office__c FROM salesforce.contact WHERE email = '${valueLogin}'
    AND password__c = '${valuePass}';`)

  for (let [keys, values] of Object.entries(result.rows)) {
    console.log(result);

    for (let [key, value] of Object.entries(values)) {
      tempArr.push(value);
    }
  }

  if (!tempArr.length) {
    tempArr.length = 0;
  }
  return tempArr;
};

bot.catch((err, ctx) => {
  console.log(`Ooops, ecountered an error for ${ctx.updateType}`, err)
})