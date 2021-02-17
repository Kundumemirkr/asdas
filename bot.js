const fs=require('fs');
const Discord=require("discord.js");
const client=new Discord.Client();
const db = require('quick.db')
const chalk = require("chalk");
const moment = require("moment");
const ayarlar=require("./ayarlar.json");
const express = require('express');
/////
const app = express()
app.get('/', (req, res) => res.send("Bot Aktif | Discord = https://discord.gg/GXZr3eSGYS"))
app.listen(process.env.PORT, () => console.log('Port ayarlandı: ' + process.env.PORT))
//////////////////


client.on("message", message => {
  let client = message.client;
  if (message.author.bot) return;
  if (!message.content.startsWith(ayarlar.prefix)) return;
  let command = message.content.split(' ')[0].slice(ayarlar.prefix.length);
  let params = message.content.split(' ').slice(1);
  let perms = client.yetkiler(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
     cmd.run(client, message, params, perms);
  }
})





const log = message => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} adet komut yüklemeye hazırlanılıyor.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut ismi: ${props.help.name.toUpperCase()}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});


client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

  
client.yetkiler = message => {
  if(!message.guild) {
	return; }
  let permlvl = -ayarlar.varsayilanperm  ;
  if(message.member.hasPermission("MANAGE_MESSAGES")) permlvl = 1;
  if(message.member.hasPermission("KICK_MEMBERS")) permlvl = 2;
  if(message.member.hasPermission("BAN_MEMBERS")) permlvl = 3;
  if(message.member.hasPermission("MANAGE_GUILD")) permlvl = 4;
  if(message.member.hasPermission("ADMINISTRATOR")) permlvl = 5;
  if(message.author.id === message.guild.ownerID) permlvl = 6;
  if(message.author.id === ayarlar.sahip) permlvl = 7;
  return permlvl;
};


///////////////////////////////KOMUTLAR//////////////////////////////

//---------------------------------DDOS KORUMASI-----------------------------\\
client.on('message', msg => {

if(client.ping > 2500) {

            let bölgeler = ['singapore', 'eu-central', 'india', 'us-central', 'london',
            'eu-west', 'amsterdam', 'brazil', 'us-west', 'hongkong', 
            'us-south', 'southafrica', 'us-east', 'sydney', 'frankfurt',
            'russia']
           let yenibölge = bölgeler[Math.floor(Math.random() * bölgeler.length)]
           let sChannel = msg.guild.channels.find(c => c.name === "ddos-system")

           sChannel.send(`Sunucu'ya Vuruyorlar \nSunucu Bölgesini Değiştirdim \n __**${yenibölge}**__ :tik: __**Sunucu Pingimiz**__ :`+ client.ping)
           msg.guild.setRegion(yenibölge)
           .then(g => console.log(" bölge:" + g.region))
           .then(g => msg.channel.send("bölge **"+ g.region  + " olarak değişti")) 
           .catch(console.error);
}});
//---------------------------------DDOS KORUMASI-----------------------------\\

client.on("roleDelete", async(role , channel , message , guild) => {
  let rolkoruma = await db.fetch(`rolk_${role.guild.id}`);
    if (rolkoruma == "acik") {
  role.guild.createRole({name: role.name, color: role.color,  permissions: role.permissions}) 
        role.guild.owner.send(` **${role.name}** Adlı Rol Silindi Ve Ben Rolü Tekrar Oluşturdum  :white_check_mark::`)

  
}
})

//KanalKoruma
client.on("channelDelete", async function(channel) {
    let rol = await db.fetch(`Rixnux_${channel.guild.id}`);
  
  if (rol) {
const guild = channel.guild.cache;
let channelp = channel.parentID;

  channel.clone().then(z => {
    let kanal = z.guild.channels.find(c => c.name === z.name);
    kanal.setParent(
      kanal.guild.channels.find(channel => channel.id === channelp)
      
    );
  });
  }
})

///reklam-engelle///
client.on("message", async msg => {
  if (msg.author.bot) return;
  if (msg.channel.type === "dm") return;

  let i = await db.fetch(`reklamFiltre_${msg.guild.id}`);
  if (i == "acik") {
    const reklam = [
      "discord.app",
      "discord.gg",
      "invite",
      "discordapp",
      "discordgg",
      ".com",
      ".net",//Lord Creative
      ".xyz",
      ".tk",
      ".pw",
      ".io",
      ".me",
      ".gg",
      "www.",
      "https",
      "http",
      ".gl",
      ".org",
      ".com.tr",
      ".biz",
      ".party",
      ".rf.gd",
      ".az"
    ];
    if (reklam.some(word => msg.content.toLowerCase().includes(word))) {
      try {
        if (!msg.member.hasPermission("MANAGE_GUILD")) {
          msg.delete();
          let embed = new Discord.MessageEmbed()
            .setColor(0xffa300)
            .setFooter(
              " Reklam engellendi.",
              client.user.avatarURL()
            )
            .setAuthor(
              msg.guild.owner.user.username,
              msg.guild.owner.user.avatarURL()
            )
            .setDescription(
              "AlperenBot Reklam Sistemi, " +
                `**${msg.guild.name}**` +
                " Adlı Sunucuda Reklam Yakaladım."
            )
            .addField(
              "Reklamı yapan kişi",
              "Kullanıcı: " + msg.author.tag + "\nID: " + msg.author.id,
              true
            )
            .addField("Engellenen mesaj", msg.content, true)
            .setTimestamp();
          msg.guild.owner.user.send(embed);
          return msg.channel
            .send(`${msg.author.tag}, Reklam Yapmak Yasak!`)
            .then(msg => msg.delete(25000));
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  if (!i) return;
});

///küfür///
client.on("message", async msg => {
  if (msg.author.bot) return;
  if (msg.channel.type === "dm") return;

  let i = await db.fetch(`küfürFiltre_${msg.guild.id}`);
  if (i == "acik") {
  const küfür = ["siktir",
"yarrak",
"orospu",
"piç",
"sikerim",
"sikik",
"amına",
"pezevenk",
"yavşak",
"ananı",
"anandır",
"orospu",
"evladı",
"göt",
"yarak",               
"aq",
"m k",
"anaskm",
"anask m",
"m a l",
"o c",
"beyinsiz",
"a m",
"got",
"g ot",
"go t",
"aptal",
"annesiz",
"Götü",
"Senin Kafanı Sikeyim",
"sikmek",
"sg",
"sikmek",
"amınoglu",
"aminoglu",
"aminoğlu",
"amınoğlu",
"sikim", 
"sikiyim",
"orospu çocuğu",
"piç kurusu",
"kahpe",
"sikimi ye",
"m q",
"sik",
"amguard",
"sekssüel",
"seksüel",
"Ânanîn âmını sïkïm",
"oç",
"o ç",
"orosbu",
"Get the fuck outta here",
"What the fuck are you",
"Kick your ass",
"Get the fuck up",
"fuck",
"fuck you",
"shit,",
"damn",
"fahise","sikcem",
"fahişe",
"feriştah",
"ferre",
"fuck",
"fucker",
"fuckin",
"fucking",
"gavad",
"gavat",
"geber",
"geberik",
"gebermek",
"gebermiş",
"gebertir",
"gerızekalı",
"gerizekalı",
"gerizekali",
"gerzek",
"giberim",
"giberler",
"gibis",
"gibiş",
"gibmek",
"gibtiler",
"goddamn",
"godoş",
"godumun",
"gotelek",
"gotlalesi",
"gotlu",
"gotten",
"gotundeki",
"gotunden",
"gotune",
"gotunu",
"gotveren",
"goyiim",
"goyum",
"goyuyim",
"goyyim",
"göt",
"göt deliği",
"götelek",
"göt herif",
"götlalesi",
"götlek",
"götoğlanı",
"göt oğlanı",
"götoş",
"götten",
"götü",
"götün",
"götüne",
"götünekoyim",
"götüne koyim",
"götünü",
"götveren",
"göt veren",
"göt verir",
"gtelek",
"gtn",
"gtnde",
"gtnden",
"gtne",
"gtten",
"gtveren",
"hasiktir",
"hassikome",
"hassiktir",
"has siktir",
"hassittir",
"haysiyetsiz",
"hayvan herif",
"hoşafı",
"hödük",
"hsktr",
"huur",
"ıbnelık",
"ibina",
"ibine",
"ibinenin",
"ibne",
"ibnedir",
"ibneleri",
"ibnelik",
"ibnelri",
"ibneni",
"ibnenin",
"ibnerator",
"ibnesi",
"idiot",
"idiyot",
"imansz",
"ipne",
"iserim",
"işerim",
"itoğlu it",
"kafam girsin",
"kafasız",
"kafasiz",
"kahpe",
"kahpenin",
"kahpenin feryadı",
"kaka",
"kaltak",
"kancık",
"kancik",
"kappe",
"karhane",
"kaşar",
"kavat",
"kavatn",
"kaypak",
"kayyum",
"kerane",
"kerhane",
"kerhanelerde",
"kevase",
"kevaşe",
"kevvase",
"koca göt",
"koduğmun",
"koduğmunun",
"kodumun",
"kodumunun",
"koduumun",
"koyarm",
"koyayım",
"koyiim",
"koyiiym",
"koyim",
"koyum",
"koyyim",
"krar",
"kukudaym",
"laciye boyadım",
"lavuk",
"liboş",
"madafaka",
"malafat",
"malak",
"manyak",
"mcik",
"memelerini",
"mezveleli",
"minaamcık",
"mincikliyim",
"mna",
"monakkoluyum",
"motherfucker",
"mudik",
"oc",
"ocuu",
"ocuun",
"OÇ",
"oç",
"o. çocuğu",
"oğlan",
"oğlancı",
"oğlu it",
"orosbucocuu",
"orospu",
"orospucouguv",
"orospu cocugu",
"orospu çoc",
"orospuçocuğu",
"orospu çocuğu",
"orospu çocuğudur",
"orospu çocukları",
"orospudur",
"orospular",
"orospunun",
"orospunun evladı",
"orospuydu",
"orospuyuz",
"orostoban",
"orostopol",
"orrospu",
"oruspu",
"oruspuçocuğu",
"oruspu çocuğu",
"osbir",
"ossurduum",
"ossurmak",
"ossuruk",
"osur",
"osurduu",
"osuruk",
"osururum",
"otuzbir",
"öküz",
"öşex",
"patlak zar",
"penis",
"pezevek",
"pezeven",
"pezeveng",
"pezevengi",
"pezevengin evladı",
"pezevenk",
"pezo",
"pic",
"pici",
"picler",
"piç",
"piçin oğlu",
"piç kurusu",
"piçler",
"pipi",
"pipiş",
"pisliktir",
"porno",
"pussy",
"puşt",
"puşttur",
"rahminde",
"revizyonist",
"s1kerim",
"s1kerm",
"s1krm",
"sakso",
"saksofon",
"salaak",
"salak",
"saxo",
"sekis",
"serefsiz",
"sevgi koyarım",
"sevişelim",
"sexs",
"sıçarım",
"sıçtığım",
"sıecem",
"sicarsin",
"sie",
"sik",
"sikdi",
"sikdiğim",
"sike",
"sikecem",
"sikem",
"siken",
"sikenin",
"siker",
"sikerim",
"sikerler",
"sikersin",
"sikertir",
"sikertmek",
"sikesen",
"sikesicenin",
"sikey",
"sikeydim",
"sikeyim",
"sikeym",
"siki",
"sikicem",
"sikici",
"sikien",
"sikienler",
"sikiiim",
"sikiiimmm",
"sikiim",
"sikiir",
"sikiirken",
"sikik",
"sikil",
"sikildiini",
"sikilesice",
"sikilmi",
"sikilmie",
"sikilmis",
"sikilmiş",
"sikilsin",
"sikim",
"sikimde",
"sikimden",
"sikime",
"sikimi",
"sikimiin",
"sikimin",
"sikimle",
"sikimsonik",
"sikimtrak",
"sikin",
"sikinde",
"sikinden",
"sikine",
"sikini",
"sikip",
"sikis",
"sikisek",
"sikisen",
"sikish",
"sikismis",
"sikiş",
"sikişen",
"sikişme",
"sikitiin",
"sikiyim",
"sikiym",
"sikiyorum",
"sikkim",
"sikko",
"sikleri",
"sikleriii",
"sikli",
"sikm",
"sikmek",
"sikmem",
"sikmiler",
"sikmisligim",
"siksem",
"sikseydin",
"sikseyidin",
"siksin",
"siksinbayav",
"siksinler",
"siksiz",
"siksok",
"siksz",
"sikt",
"sikti",
"siktigimin",
"siktigiminin",
"siktiğim",
"siktiğimin",
"siktiğiminin",
"siktii",
"siktiim",
"siktiimin",
"siktiiminin",
"siktiler",
"siktimv",
"siktim",
"siktimin",
"siktiminin",
"siktir",
"siktir et",
"siktirgit",
"siktir git",
"siktirir",
"siktiririm",
"siktiriyor",
"siktir lan",
"siktirolgit",
"siktir ol git",
"sittimin",
"sittir",
"skcem",
"skecem",
"skem",
"sker",
"skerim",
"skerm",
"skeyim",
"skiim",
"skik",
"skim",
"skime",
"skmek",
"sksin",
"sksn",
"sksz",
"sktiimin",
"sktrr",
"skyim",
"slaleni",
"sokam",
"sokarım",
"sokarim",
"sokarm",
"sokarmkoduumun",
"sokayım",
"sokaym",
"sokiim",
"soktuğumunun",
"sokuk",
"sokum",
"sokuş",
"sokuyum",
"soxum",
"sulaleni",
"sülaleni",
"sülalenizi",
"sürtük",
"şerefsiz",
"şıllık",
"taaklarn",
"taaklarna",
"tarrakimin",
"tasak",
"tassak",
"taşak",
"taşşak",
"tipini s.k",
"tipinizi s.keyim",
"tiyniyat",
"toplarm",
"topsun",
"totoş",
"vajina",
"vajinanı",
"veled",
"veledizina",
"veled i zina",
"verdiimin",
"weled",
"weledizina",
"whore",
"xikeyim",
"yaaraaa",
"yalama",
"yalarım",
"yalarun",
"yaraaam",
"yarak",
"yaraksız",
"yaraktr",
"yaram",
"yaraminbasi",
"yaramn",
"yararmorospunun",
"yarra",
"yarraaaa",
"yarraak",
"yarraam",
"yarraamı",
"yarragi",
"yarragimi",
"yarragina",
"yarragindan",
"yarragm",
"yarrağ",
"yarrağım",
"yarrağımı",
"yarraimin",
"yarrak",
"yarram",
"yarramin",
"yarraminbaşı",
"yarramn",
"yarran",
"yarrana",
"yarrrak",
"yavak",
"yavş",
"yavşak",
"yavşaktır",
"yavuşak",
"yılışık",
"yilisik",
"yogurtlayam",
"yoğurtlayam",
"yrrak",
"zıkkımım",
"zibidi",
"zigsin",
"zikeyim",
"zikiiim",
"zikiim",
"zikik",
"zikim",
"ziksiiin",
"ziksiin",
"zulliyetini",          
"damn","dick","crap","fag","piss","pussy","asshole","slut","cock","darn","douche","bastard","You are dick","You’re so unnecessary","Slut","Shut the fuck up","Shove it up your ass","Motherfucker",
"fucker","bitch","Ass hole"];
    

    if (küfür.some(word => msg.content.toLowerCase().includes(word))) {
      try {
        if (!msg.member.hasPermission("MANAGE_WEBHOOKS")) {
          msg.delete();
          let embed = new Discord.MessageEmbed()
            .setColor(0xffa300)
            .setFooter("AlperenBot Küfür Sistemi", client.user.avatarURL())
            .setAuthor(
              msg.guild.owner.user.username,
              msg.guild.owner.user.avatarURL()
            )
            .setDescription(
              "AlperenBot, " +
                `***${msg.guild.name}***` +
                " adlı sunucunuzda küfür yakaladım."
            )
            .addField(
              "Küfür Eden Kişi",
              "Kullanıcı: " + msg.author.tag + "\nID: " + msg.author.id,
              true
            )
            .addField("Engellenen mesaj", msg.content, true)
            .setTimestamp();
          msg.guild.owner.user.send(embed);
          return msg.channel
            .send(
              `${msg.author}, Küfür Etmek Yasak! Senin Mesajını Özelden Kurucumuza Gönderdim.`
            )
            .then(msg => msg.delete(25000));
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  if (!i) return;
});

/////////////////////////////////////////////////////////////////////////////////////////////
client.on("message", async message => {
  if (message.author.bot || message.channel.type === "dm") return;

  var afklar = await db.fetch(`afk_${message.author.id}, ${message.guild.id}`);

  if (afklar) {
    db.delete(`afk_${message.author.id}, ${message.guild.id}`);
    db.delete(`afk-zaman_${message.author.id}, ${message.guild.id}`);

    message.reply(`Afklıktan Çıktın!`)
    try {
      let isim = message.member.nickname.replace("[AFK]", "");
      message.member.setNickname(isim).catch(err => console.log(err));
    } catch (err) {
      console.log(err.message);
    }
  }
  let ms = require("ms");

  var kullanıcı = message.mentions.users.first();
  if (!kullanıcı) return;
  let zaman = await db.fetch(`afk-zaman_${kullanıcı.id}, ${message.guild.id}`);

  var süre = ms(new Date().getTime() - zaman);

  var sebep = await db.fetch(`afk_${kullanıcı.id}, ${message.guild.id}`);
  if (
    await db.fetch(
      `afk_${message.mentions.users.first().id}, ${message.guild.id}`
    )
  ) {
    if (süre.days !== 0) {
const dcs = new Discord.MessageEmbed()
.setTitle(":uyarii: Uyarı!")
.setDescription("Etiketlediniz Kullanıcı Afk!")
.addField("Afk Nedeni:",`> ${sebep}`)
.setColor("RANDOM")
.setThumbnail(message.author.avatarURL())
.addField("Afk Olma Süresi",`> ${süre}`);
message.channel.send(dcs)
      return;
    }
  }
});
////////////////////////////////////////////////////////////////////
client.on("message", async msg => {
 
 
  const i = await db.fetch(`ssaass_${msg.guild.id}`);
    if (i == 'acik') {
      if (msg.content.toLowerCase() == 'sa' || msg.content.toLowerCase() == 's.a' || msg.content.toLowerCase() == 'selamun aleyküm' || msg.content.toLowerCase() == 'sea'|| msg.content.toLowerCase() == 'selam') {
          try {
 
                  return msg.reply(
                    'Aleyküm Selam, Hoşgeldin')
          } catch(err) {
            console.log(err);
          }
      }
    }
    else if (i == 'kapali') {
   
    }
    if (!i) return;
 
    });

client.login(process.env.token)

client.on('guildDelete', guild => {

let Crewembed = new Discord.MessageEmbed()

.setColor("RED")
.setTitle(" Bot Bir sunucuda kicklendi,bilgiler;   ")
.addField("Sunucu Adı:", guild.name)
.addField("Sunucu sahibi", guild.owner)
.addField("Sunucudaki Kişi Sayısı:", guild.memberCount)

   client.channels.cache.get('804389960882061333').send(Crewembed);
  
});


client.on('guildCreate', guild => {

let Crewembed = new Discord.MessageEmbed()

.setColor("GREEN")
.setTitle(" Bot Bir sunucuya eklendi,bilgiler;  ")
.addField("Sunucu Adı:", guild.name)
.addField("Sunucu sahibi", guild.owner)
.addField("Sunucudaki Kişi Sayısı:", guild.memberCount)

   client.channels.cache.get('804389960882061333').send(Crewembed);
  
});




//-------------------- Ever Here Engel --------------------//
//-------------------- Ever Here Engel --------------------//
//-------------------- Ever Here Engel --------------------//

client.on("message", async msg => {
  let hereengelle = await db.fetch(`hereengel_${msg.guild.id}`);
  if (hereengelle == "acik") {
    const here = ["@here","@everyone"];
    if (here.some(word => msg.content.toLowerCase().includes(word))) {
      if (!msg.member.hasPermission("ADMINISTRATOR")) {
        msg.delete();
        msg.channel
          .send(`<@${msg.author.id}>`)
          .then(message => message.delete());
        var e = new Discord.MessageEmbed()
          .setColor("BLACK")
          .setDescription(`Bu Sunucuda Everyone ve Here Yasak!`);
        msg.channel.send(e);
      }
    }
  } else if (hereengelle == "kapali") {
  }//lrowsxrd
});
            

client.on("guildMemberAdd", async member => {
let rolisim = await db.fetch(`otorolisim_${member.guild.id}`);
let EGG = await db.fetch(`rol_${member.guild.id}`) 
let Ottoman = await db.fetch(`kanal_${member.guild.id}`)
if(!EGG || !Ottoman) return
member.roles.add(EGG)
client.channels.cache.get(Ottoman).send(
new Discord.MessageEmbed()
    .setColor("#00aaff")
  .setDescription(`**Sunucumuza Yeni Katılan **${member}** Adlı Kullanıcıya \`${rolisim}\` Rolünü Başarıyla Verdim**`)
)
  });



client.on("guildMemberAdd", async member => {
let judgedev = await db.fetch(`judgeteam?Ototag_${member.guild.id}`) 
let judgekanal = await db.fetch(`judgeteam?OtotagKanal_${member.guild.id}`)
if(!judgedev || !judgekanal) return
 
 member.setNickname(`${judgedev} ${member.user.username}`)
client.channels.cache.get(judgekanal).send(`**${member.user.username}** Adlı Kullanıcıya Otomatik Tag Verildi! :inbox_tray:`)
 
});






// SAYAÇ
client.on("guildMemberAdd", async member => {
  let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal = await db.fetch(`sayacK_${member.guild.id}`);
  if (!sayac) return;
  if (member.guild.memberCount >= sayac) {
    member.guild.channels.cache
      .get(skanal)
      .send(
        `📥 **${ 
          member.user.tag
        }** sunucuya **katıldı**! \`${db.fetch(
          `sayac_${member.guild.id}`
        )}\` kişi olduk! <a:gzeltik:773612444941287465> Sayaç sıfırlandı.`
);
   db.delete(`sayac_${member.guild.id}`);
    db.delete(`sayacK_${member.guild.id}`);
    return;
  } else {
    member.guild.channels.cache
      .get(skanal)
      .send(
        `📥 **${
          member.user.tag
        }** sunucuya **katıldı**! \`${db.fetch(
          `sayac_${member.guild.id}`
        )}\` üye olmamıza son \`${db.fetch(`sayac_${member.guild.id}`) -
          member.guild.memberCount}\` üye kaldı! Sunucumuz şuanda \`${
          member.guild.memberCount
        }\` kişi!`
);
}
});

client.on("guildMemberRemove", async member => {
  let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal = await db.fetch(`sayacK_${member.guild.id}`);
  if (!sayac) return;
  member.guild.channels.cache
    .get(skanal)
    .send(
      `📤  **${
        member.user.tag
      }** sunucudan **ayrıldı**! \`${db.fetch(
        `sayac_${member.guild.id}`
      )}\` üye olmamıza son \`${db.fetch(`sayac_${member.guild.id}`) -
        member.guild.memberCount}\` üye kaldı! Sunucumuz şuanda \`${
        member.guild.memberCount
      }\` kişi!`
);
});





///////////ModLog/////////////////////////

client.on('channelCreate', async channel => {
  const c = channel.guild.channels.cache.get(db.fetch(`codeminglog_${channel.guild.id}`));
  if (!c) return;
    var embed = new Discord.MessageEmbed()
                    .addField(`Kanal oluşturuldu`, ` İsmi: \`${channel.name}\`\n Türü: **${channel.type}**\n► ID: ${channel.id}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${channel.client.user.username}#${channel.client.user.discriminator}`, channel.client.user.avatarURL)
    c.send(embed)
});

client.on('channelDelete', async channel => {
  const c = channel.guild.channels.cache.get(db.fetch(`codeminglog_${channel.guild.id}`));
  if (!c) return;
    let embed = new Discord.MessageEmbed()
                    .addField(`Kanal silindi`, ` İsmi: \`${channel.name}\`\n Türü: **${channel.type}**\n��� ID: ${channel.id}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${channel.client.user.username}#${channel.client.user.discriminator}`, channel.client.user.avatarURL)

    c.send(embed)
});

   client.on('channelNameUpdate', async channel => {
  const c = channel.guild.channels.cache.get(db.fetch(`codeminglog_${channel.guild.id}`));
  if (!c) return;
    var embed = new Discord.MessageEmbed()
                    .addField(`Kanal İsmi değiştirildi`, ` Yeni İsmi: \`${channel.name}\`\n► ID: ${channel.id}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${channel.client.user.username}#${channel.client.user.discriminator}`, channel.client.user.avatarURL)
    c.send(embed)
});

client.on('emojiCreate', emoji => {
  const c = emoji.guild.channels.cache.get(db.fetch(`codeminglog_${emoji.guild.id}`));
  if (!c) return;

    let embed = new Discord.MessageEmbed()
                    .addField(`Emoji oluşturuldu`, ` İsmi: \`${emoji.name}\`\n GIF?: **${emoji.animated}**\n► ID: ${emoji.id}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${emoji.client.user.username}#${emoji.client.user.discriminator}`, emoji.client.user.avatarURL)

    c.send(embed)
    });
client.on('emojiDelete', emoji => {
  const c = emoji.guild.channels.cache.get(db.fetch(`codeminglog_${emoji.guild.id}`));
  if (!c) return;

    let embed = new Discord.MessageEmbed()
                    .addField(`Emoji silindi`, ` İsmi: \`${emoji.name}\`\n GIF? : **${emoji.animated}**\n► ID: ${emoji.id}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${emoji.client.user.username}#${emoji.client.user.discriminator}`, emoji.client.user.avatarURL)

    c.send(embed)
    });
client.on('emojiUpdate', (oldEmoji, newEmoji) => {
  const c = newEmoji.guild.channels.cache.get(db.fetch(`codeminglog_${newEmoji.guild.id}`));
  if (!c) return;

    let embed = new Discord.MessageEmbed()
                    .addField(`Emoji güncellendi`, ` Eski ismi: \`${oldEmoji.name}\`\n Yeni ismi: \`${newEmoji.name}\`\n► ID: ${oldEmoji.id}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${newEmoji.client.user.username}#${newEmoji.client.user.discriminator}`, newEmoji.client.user.avatarURL)

    c.send(embed)
    });

client.on('guildBanAdd', async (guild, user) => {    
    const channel = guild.channels.cache.get(db.fetch(`codeminglog_${guild.id}`));
  if (!channel) return;
  
  const entry = await guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first())

    let embed = new Discord.MessageEmbed()
                    .setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL)
                    .addField(`Kullanıcı banlandı`, ` İsmi: \`${user.username}\`\n ID: **${user.id}**\n Sebep: **${entry.reason || 'Belirtmedi'}**\n Banlayan: **${entry.executor.username}#${entry.executor.discriminator}**`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${entry.executor.username}#${entry.executor.discriminator} tarafından`, entry.executor.avatarURL)

    channel.send(embed)
});

client.on('guildBanRemove', async (guild, user) => {    
    const channel = guild.channels.cache.get(db.fetch(`codeminglog_${guild.id}`));
  if (!channel) return;
  
  const entry = await guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first())

    let embed = new Discord.MessageEmbed()
                    .setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL)
                    .addField(`Kullanıcının banı açıldı`, ` İsmi: \`${user.username}\`\n ID: **${user.id}**\n Banı Kaldıran: **${entry.executor.username}#${entry.executor.discriminator}**`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${entry.executor.username}#${entry.executor.discriminator} tarafından`, entry.executor.avatarURL)

    channel.send(embed)
});
client.on('messageDelete', async message => {    
  if(message.author.bot) return

    const channel = message.guild.channels.cache.get(db.fetch(`codeminglog_${message.guild.id}`));
  if (!channel) return;
  
    let embed = new Discord.MessageEmbed()
                    .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
                    .setTitle("Mesaj silindi")                
                    .addField(`Silinen mesaj : ${message.content}`,`Kanal: ${message.channel.name}`)
                  //  .addField(`Kanal:`,`${message.channel.name}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${message.client.user.username}#${message.client.user.discriminator}`, message.client.user.avatarURL)

    channel.send(embed)
});

client.on('messageUpdate', async(oldMessage, newMessage) => {
    if(oldMessage.author.bot) return;
    if(oldMessage.content == newMessage.content) return;

    const channel = oldMessage.guild.channels.cache.get(db.fetch(`codeminglog_${oldMessage.guild.id}`));
    if(!channel) return;

    let embed = new Discord.MessageEmbed()
    .setTitle("Mesaj güncellendi!")
    .addField("Eski mesaj : ",`${oldMessage.content}`)
    .addField("Yeni mesaj : ",`${newMessage.content}`)
    .addField("Kanal : ",`${oldMessage.channel.name}`)
    .setTimestamp()
    .setColor("RANDOM")
    .setFooter(`${oldMessage.client.user.username}#${oldMessage.client.user.discriminator}`,`${oldMessage.client.user.avatarURL}`)

    channel.send(embed)
});

client.on('roleCreate', async (role) => {    

    const channel = role.guild.channels.cache.get(db.fetch(`codeminglog_${role.guild.id}`));
  if (!channel) return;
  
    let embed = new Discord.MessageEmbed()
.addField(`Rol oluşturuldu`, ` ismi: \`${role.name}\`\n ID: ${role.id}`)                    
.setTimestamp()
.setColor("RANDOM")
.addField("Rol renk kodu : ",`${role.hexColor}`)
.setFooter(`${role.client.user.username}#${role.client.user.discriminator}`, role.client.user.avatarURL)

    channel.send(embed)
});

client.on('roleDelete', async (role) => {    

    const channel = role.guild.channels.cache.get(db.fetch(`codeminglog_${role.guild.id}`));
  if (!channel) return;
  
    let embed = new Discord.MessageEmbed()
.addField(`Rol silindi`, ` ismi: \`${role.name}\`\n ID: ${role.id}`)                    
.setTimestamp()
.setColor("RANDOM")
    .addField("Rol renk kodu : ",`${role.hexColor}`)
.setFooter(`${role.client.user.username}#${role.client.user.discriminator}`, role.client.user.avatarURL)

    channel.send(embed)
})

///////////////////////////////MOD LOG SON////////////////


////anitraid///

client.on("guildMemberAdd", member => {
  let guvenlik = db.fetch(`bottemizle_${member.guild.id}`);
  if (!guvenlik) return;
  if (member.user.bot !== true) {
  } else {
    member.ban(member);
  }
});
////antiradi///





// Ban ve Rol Koruma Devam
client.on("guildBanAdd", async (guild, user) => {
  let kontrol = await db.fetch(`dil_${guild.id}`);
  let kanal = await db.fetch(`bank_${guild.id}`);
  let rol = await db.fetch(`banrol_${guild.id}`);
  if (!kanal) return;
  if (kontrol == "agayokaga") {
    const entry = await guild
      .fetchAuditLogs({ type: "GUILD_BAN_ADD" })
      .then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == guild.owner.id) return;
    guild.members.unban(user.id);
    guild.members.cache.get(entry.executor.id).kick();
    const embed = new Discord.MessageEmbed()
      .setTitle(`Biri Yasaklandı!`)
      .setColor("BLACK")
      .addField(`Yasaklayan`, entry.executor.tag)
      .addField(`Yasaklanan Kişi`, user.name)
      .addField(
        `Sonuç`,
        `Yasaklayan kişi sunucudan açıldı!\nve yasaklanan kişinin yasağı kalktı!`
      );
    client.channels.cache.get(kanal).send(embed);
  } else {
    const entry = await guild
      .fetchAuditLogs({ type: "GUILD_BAN_ADD" })
      .then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == guild.owner.id) return;
    guild.members.unban(user.id);
    guild.members.cache.get(entry.executor.id).kick();
    const embed = new Discord.MessageEmbed()
      .setTitle(`Biri Yasaklandı!`)
      .setColor("BLACK")
      .addField(`Yasaklayan`, entry.executor.tag)
      .addField(`Yasaklanan Kişi`, user.name)
      .addField(
        `Sonuç`,
        `Yasaklayan Kişi Sunucudan Atıldı ve yasaklanan kişinin yasağı kalktı `
      );
    client.channels.cache.get(kanal).send(embed);
  }
});
client.on("roleDelete", async role => {
  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_DELETE" })
    .then(audit => audit.entries.first());
  let rol = await db.fetch(`rolrol_${role.guild.id}`);
  let kontrol = await db.fetch(`dil_${role.guild.id}`);
  let kanal = await db.fetch(`rolk_${role.guild.id}`);
  if (!kanal) return;
  if (kontrol == "TR_tr") {
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == role.guild.owner.id) return;
    role.guild.roles
      .create({
        data: {
          name: role.name
        }
      })
      .then(r => r.setPosition(role.position));

    const embed = new Discord.MessageEmbed()
      .setTitle(`Bir Rol Silindi!`)
      .setColor("BLACK")
      .addField(`Silen`, entry.executor.tag)
      .addField(`Silinen Rol`, role.name)
      .addField(`Sonuç`, `Rol Geri Açıldı!`);
    client.channels.cache.get(kanal).send(embed);
  } else {
    if (entry.executor.id == client.user.id) return;
    if (entry.executor.id == role.guild.owner.id) return;
    role.guild.roles
      .create({
        data: {
          name: role.name
        }
      })
      .then(r => r.setPosition(role.position));

    const embed = new Discord.MessageEmbed()
      .setTitle(`Bir Rol Silindi!`)
      .setColor("BLACK")
      .addField(`Silen`, entry.executor.tag)
      .addField(`Silinen Rol`, role.name)
      .addField(`Sonuç`, `Silinen Rol Geri Açıldı!`);
    client.channels.cache.get(kanal).send(embed);
  }
});


// Ban ve Rol Koruma bitiş




//------------Seviye-------------------//
client.on("message", async message => {
  let prefix = ayarlar.prefix;

  var id = message.author.id
  var gid = message.guild.id

  let hm = await db.fetch(`seviyeacik_${gid}`);
  let kanal = await db.fetch(`svlog_${gid}`);
  let xps = await db.fetch(`verilecekxp_${gid}`);
  let seviyerol = await db.fetch(`svrol_${gid}`);
  let rollvl = await db.fetch(`rollevel_${gid}`);

  if (!hm) return;
  if (message.content.startsWith(prefix)) return;
  if (message.author.bot) return;

  var xp = await db.fetch(`xp_${id}_${gid}`);
  var lvl = await db.fetch(`lvl_${id}_${gid}`);
  var xpToLvl = await db.fetch(`xpToLvl_${id}_${gid}`);

  if (!lvl) {
    
    if (xps) {
      db.set(`xp_${id}_${gid}`, xps);
    }
    db.set(`xp_${id}_${gid}`, 4);
    db.set(`lvl_${id}_${gid}`, 1);
    db.set(`xpToLvl_${id}_${gid}`, 100);
  } else {
    if (xps) {
      db.add(`xp_${id}_${gid}`, xps);
    }
    db.add(`xp_${id}_${gid}`, 4);

    if (xp > xpToLvl) {
      db.add(`lvl_${id}_${gid}`, 1);
      db.add(
        `xpToLvl_${id}_${gid}`,
        (await db.fetch(`lvl_${id}_${gid}`)) * 100
      );
      if (kanal) {
        client.channels.cache.get(kanal.id)
          .send(
            message.member.user.username +
              " Seviye Atladı! Yeni seviyesi** " +
              lvl +
              " **Tebrikler! "
          );

        
      }
   
    }

    if (seviyerol) {
      if (lvl >= rollvl) {
        message.guild.member(message.author.id).roles.add(seviyerol);
        if (kanal) {
          client.channels.cache.get(kanal.id)
            .send(
              message.member.user.username +
                " Yeni Seviyesi** " +
                rollvl +
                " **ve** " +
                seviyerol +
                " **Rolünü kazandı!"
            );
        }
      }
    }
  }

  
});

