const moment = require('moment');
const db = require('./db')

const announce = {
    getHourlyWarning(client) {
        const dateTime = moment();
        const date = dateTime.format('YYYY-MM-DD');
        const timeLower = dateTime.add(45, 'minutes').format('HH:mm');
        const timeUpper = dateTime.add(15, 'minutes').format('HH:mm'); //adding is cumulative - this is an hour later than present
        db.getEventsInTimeRange(date, timeLower, timeUpper)
            .then(events => {
                if (events.length > 0) {
                    const output = events.reduce((message, event) => {
                        const date = moment(event.date).add(event.time).format('dddd Do MMMM YYYY, HH:mm');
                        return message + 
                        `${event.name} - ${event.location} - ${date}` + '\n\n' +
                        (event.link ? event.link + '\n\n' : '') +
                        event.description + '\n----------\n'
                    },
                    '----------\n@here, the following events are happening in an hour or less!\n----------\n')
                    client.channels.cache.get(process.env.ANNOUNCEMENT_CHANNEL_ID).send(output);
                }
            })
            .catch(err => client.channels.cache.get(process.env.ADMIN_CHANNEL_ID).send(err.message))
    },
    
    getDailyEvents(client) {
        const date = moment().format('YYYY-MM-DD');
        db.getDailyEvents(date)
            .then(events => {
                if (events.length > 0) {
                    const output = events.reduce((message, event) => {
                        const eventDate = moment(event.date).add(event.time).format('dddd Do MMMM YYYY, HH:mm');
                        return message + 
                            `${event.name} - ${event.location} - ${eventDate}` + '\n\n' +
                            (event.link ? event.link + '\n\n' : '') +
                            event.description + '\n----------\n'
                    },
                    '----------\nToday\'s Events (' + date + ')\n----------\n' 
                    )
                    client.channels.cache.get(process.env.ANNOUNCEMENT_CHANNEL_ID).send(output);
                }
            })
            .catch(err => client.channels.cache.get(process.env.ADMIN_CHANNEL_ID).send(err.message))
    },
    
    getWeeklyEvents(client) {
        const dateTime = moment();
        const currentDate = dateTime.format('YYYY-MM-DD');
        const tomorrowDate = dateTime.add(1, 'days').format('YYYY-MM-DD')
        const weekFromNowDate = dateTime.add(6, 'days').format('YYYY-MM-DD');
        db.getEventsInDateRange(currentDate, weekFromNowDate)
            .then(events => {
                if (events.length > 0) {
                    const output = events.reduce((message, event) => {
                        const date = moment(event.date).add(event.time).format('dddd Do MMMM YYYY, HH:mm');
                        return message + 
                        `${event.name} - ${event.location} - ${date}` + '\n\n' +
                        (event.link ? event.link + '\n\n' : '') +
                        event.description + '\n----------\n'
                    },
                    '----------\nThis Week\'s Events (' + tomorrowDate + '  -  ' + weekFromNowDate +  ')\n----------\n')
                    client.channels.cache.get(process.env.ANNOUNCEMENT_CHANNEL_ID).send(output);
                }
            })
            .catch(err => client.channels.cache.get(process.env.ADMIN_CHANNEL_ID).send(err.message));
    }
}

module.exports = announce;