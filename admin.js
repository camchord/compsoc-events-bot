const db = require('./db');
const moment = require('moment');

const admin = {
    createEvent(message, createEventCommand) {
        const createEventParameters = message.content.slice(createEventCommand.length + 1).split('::').map(param => param.trim());
        if (createEventParameters.length === 5 || createEventParameters.length === 6) {
            const name = createEventParameters[0];
            const description = createEventParameters[1];
            const location = createEventParameters[2]
            const date = createEventParameters[3]; 
            const time = createEventParameters[4];
            const link = createEventParameters[5] ?? '';
            this.validateInput(name, description, location, date, false, time, false, link)
                .then(([name, description, location, date, time, link]) => db.createEvent(name, description, location, date, time, link))
                .then(content => message.channel.send(content))
                .catch(err => message.channel.send(err))
        } else {
            message.channel.send('Error: Invalid number of parameters - Parameters must take the form "name :: description :: location :: date (yyyy-mm-dd) :: time (24h - hh:mm) :: link (optional)"')
        }
    },

    getEvent(message, getEventCommand) {
        const eventId = parseInt(message.content.slice(getEventCommand.length + 1));
        db.getEvent(eventId)
            .then(event => {
                const date = moment(event.date).add(event.time).format('dddd Do MMMM YYYY, HH:mm');
                const output = `${event.name} - ${event.location} - ${date}` + '\n\n' +
                (event.link ? event.link + '\n\n' : '') +
                event.description
                message.channel.send(output)
            })
            .catch(err => message.channel.send(err));
    },

    updateEvent(message, updateEventCommand) {
        const parameters = message.content.slice(updateEventCommand.length + 1)
            .split('::')
            .map(param => param.trim());
        const eventId = parseInt(parameters[0]);
        const parametersSplit = parameters.slice(1).map(param => {
            const split = param.split('==')
            return [split[0].trim().toLowerCase(), split[1].trim()]
        })
        const parametersDictionary = {
            name: '',
            description: '',
            location: '',
            date: '',
            time: '',
            link: ''
        }

        if (parametersSplit.every(param => param[0] == 'name' || param[0] == 'description' || param[0] == 'location' || param[0] == 'date' || param[0] == 'time' || param[0] == 'link') && parametersSplit.length < 6 && parametersSplit.length > 0) {
            let hasArrayTranscribeFailed = false;
            for (let i = 0; i < parametersSplit.length; i++) {
                const param = parametersSplit[i];
                if (parametersDictionary[param[0]] !== '') {
                    hasArrayTranscribeFailed = true;
                    break;
                }
                parametersDictionary[param[0]] = param[1]
            }
            if (hasArrayTranscribeFailed) {
                message.channel.send('Error: Please do not try to update with duplicate keys')
            } else {
                db.getEvent(eventId)
                    .then(existingEvent => {
                        return this.validateInput(
                            parametersDictionary.name || existingEvent.name,
                            parametersDictionary.description || existingEvent.description,
                            parametersDictionary.location || existingEvent.location,
                            parametersDictionary.date || existingEvent.date,
                            parametersDictionary.date === '',
                            parametersDictionary.time || existingEvent.time,
                            parametersDictionary.time === '',
                            parametersDictionary.link || existingEvent.link
                        )
                    })
                    .then(([name, description, location, date, time, link]) => db.updateEvent(eventId, name, description, location, date, time, link))
                    .then(content => message.channel.send(content))
                    .catch(err => message.channel.send(err))
            }
            
        } else {
            message.channel.send('Error: Invalid keys')
        }
    },

    deleteEvent(message, deleteEventCommand) {
        const eventId = parseInt(message.content.slice(deleteEventCommand.length + 1));
        db.deleteEvent(eventId)
            .then(content => message.channel.send(content))
            .catch(err => message.channel.send(err))
    },

    listEvents(message) {
        db.getAllEvents()
            .then(events => {
                const eventsMessage = events.reduce((list, event) => {
                    const date = moment(event.date).add(event.time).format('dddd Do MMMM YYYY, HH:mm');
                    return list + event.id + ' - ' + event.name + ' - ' + event.location + ' - ' + date + '\n'
                }, 'Events:\n')
                message.channel.send(eventsMessage);
            })
            .catch(err => message.channel.send(err))
    },

    validateInput(name, description, location, date, isDateFromDatabase, time, isTimeFromDatabase, link) {
        return new Promise((res, rej) => {
            if (name.length > 255) {
                rej('Name is too long - max length 255')
            } else if (location.length > 255) {
                rej('Location is too long - max length 255')
            } else if (link?.length > 255) {
                rej('Link is too long - max length 255')
            } else if (!isDateFromDatabase && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                rej('Invalid date format - Must be YYYY-MM-DD') //Todo - make sure numbers are valid - eg reject 2020-99-99
            } else if (!isTimeFromDatabase && !/^\d{2}:\d{2}$/.test(time)) {
                rej('Invalid time format - Must be HH:MM (24h)')
            } else {
                res([name, description, location, date, time, link])
            }
        })   
    }
}

module.exports = admin;