require('dotenv').config();



const schedule = require('node-schedule');
const Discord = require('discord.js');
const discordClient = new Discord.Client();

const db = require('./db');
db.init();
const admin = require('./admin');
const announce = require('./announce');

discordClient.once('ready', () => {
    console.log('Connected to Discord API');
    discordClient.channels.cache.get(process.env.ADMIN_CHANNEL_ID).send('Connected to Compsoc Events Bot');

    const weeklyUpdate = schedule.scheduleJob('0 12 * * 0', () => announce.getWeeklyEvents(discordClient));
    const dailyUpdate = schedule.scheduleJob('0 9 * * *', () => announce.getDailyEvents(discordClient));
    const hourWarning = schedule.scheduleJob('0,15,30,45 * * * *', () => announce.getHourlyWarning(discordClient));
})

const createEventCommand = '!createEvent';
const deleteEventCommand = '!deleteEvent';
const getEventCommand = '!getEvent';
const updateEventCommand = '!updateEvent';
const listEventsCommand = '!listEvents';

discordClient.on('message', (message) => {
    if (message.channel.id === process.env.ADMIN_CHANNEL_ID) {
        if (message.content.startsWith(createEventCommand)) {
            admin.createEvent(message, createEventCommand);
        } else if (message.content.startsWith(getEventCommand)) {
            admin.getEvent(message, getEventCommand);
        } else if (message.content.startsWith(updateEventCommand)) {
            admin.updateEvent(message, updateEventCommand);
        } else if (message.content.startsWith(deleteEventCommand)) {
            admin.deleteEvent(message, deleteEventCommand);
        } else if (message.content === listEventsCommand) {
            admin.listEvents(message);
        }
    } 
})

discordClient.login(process.env.BOT_TOKEN);