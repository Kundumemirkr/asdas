const Moment = require('moment')
const Discord = require('discord.js')
let prefix = '-'
module.exports = client => {
  
  const aktiviteListesi = [
    `${prefix}yardım | ${client.guilds.cache.size} sunucuya hizmet veriyoruz!🌍`,
    '81K kullanıcı hizmet veriyor🔥',
    '-yardım🔥|-davet🔥|-istatistik🔥',
    'Artık Alperen Bot V12🔥'
  ]

  client.user.setStatus('online')
  
  setInterval(() => {
    const Aktivite = Math.floor(Math.random() * (aktiviteListesi.length - 1))
    client.user.setActivity(aktiviteListesi[Aktivite])
  }, 2500)
}