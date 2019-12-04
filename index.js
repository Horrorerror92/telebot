const TelegramBot = require('node-telegram-bot-api')

const TOKEN = "997025459:AAEjEzITgsSEwZP6wr8k-6fymLVWY4LVDi8"

const bot = new TelegramBot(TOKEN, { polling: true })

bot.on('message', msg => {
  bot.sendMessage(msg.chat.id, 'Hello my friend')
})

bot.onText(/\/start (.+)/, (msg, [source, match]) => {

  const { chat: { id } } = msg
  bot.sendMessage(id, match)

})