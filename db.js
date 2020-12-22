const { Client } = require('pg');
const pg = new Client();

const db = {
    init() {
        pg.connect(err => {
            if (err) {
                console.error('Database Connection Error', err.stack);
            } else {
                console.log('Connected To Database');
            }
        })
        
        pg.query(`
            CREATE TABLE IF NOT EXISTS events(
                id serial PRIMARY KEY,
                name VARCHAR (255) NOT NULL,
                description TEXT NOT NULL,
                location VARCHAR (255) NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                link VARCHAR (255)
            )
        `)
        .then(result => console.log('Table Created'))
        .catch(err => console.error('Error: ', err.stack));
    },

    getEvent(id) {
        return new Promise((res, rej) => {
            pg.query('SELECT * FROM events WHERE id = $1', [id])
            .then(result => {
                if (result.rows.length === 0) {
                    rej('There is no event with id ' + id);
                } else {
                    res(result.rows[0])
                }
            })
            .catch(err => {
                console.log(err.stack);
                rej('Error: ' + err.message);
            })
        }) 
    },

    getAllEvents() {
        return new Promise((res, rej) => {
            pg.query('SELECT * FROM events')
                .then(result => res(result.rows))
                .catch(err => {
                    console.log(err.stack);
                    rej(err);
                })
            })
    },

    getDailyEvents(date) {
        return new Promise((res, rej) => {
            pg.query('SELECT * FROM events WHERE date = $1', [date])
                .then(result => res(result.rows))
                .catch(err => {
                    console.log(err.stack);
                    rej(err);
                })
        })
    },

    getEventsInTimeRange(date, timeLower, timeUpper) {
        return new Promise((res, rej) => {
            pg.query('SELECT * FROM events WHERE date = $1 AND time > $2 AND time <= $3', [date, timeLower, timeUpper])
                .then(result => res(result.rows))
                .catch(err => {
                    console.log(err.stack);
                    rej(err);
                })
        })
    },

    getEventsInDateRange(currentDate, futureDate) {
        return new Promise((res, rej) => {
            pg.query('SELECT * FROM events WHERE date > $1 AND date <= $2', [currentDate, futureDate])
                .then(result => res(result.rows))
                .catch(err => {
                    console.log(err.stack);
                    rej(err);
                })
            })
    },

    createEvent(name, description, location, date, time, link) {
        return new Promise((res, rej) => {
            pg.query('INSERT INTO events (name, description, location, date, time, link) VALUES ($1, $2, $3, $4, $5, $6)', [name, description, location, date, time, link])
                .then(result => res('Created event ' + name))
                .catch(err => {
                    console.log(err.stack);
                    rej('Error: Could not create event');
                })
        })
    },

    updateEvent(id, name, description, location, date, time, link) {
        return new Promise((res, rej) => {
            pg.query('UPDATE events SET name = $1, description = $2, location = $3, date = $4, time = $5, link = $6 WHERE id = $7', [name, description, location, date, time, link, id])
                .then(result => res('Updated event with id ' + id))
                .catch(err => {
                    console.log(err.stack);
                    rej('Error: Could not update event');
                })
        })
    },

    deleteEvent(id) {
        return new Promise((res, rej) => {
            pg.query('DELETE FROM events WHERE id = $1', [id])
                .then(result => res('Event ' + id + ' deleted.'))
                .catch(err => {
                    console.log(err.stack);
                    rej('Error: ' + err.message);
                })
        })
    }
}

module.exports = db;