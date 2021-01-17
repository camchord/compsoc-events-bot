Compsoc Events bot

The bot is set up to do a weekly update on Sundays at 12pm, a daily update every day at 9am, and checks every quarter hour for events in the next hour to make a warning about


Admin Commands

!createEvent {name} :: {description} :: {location} :: {date (yyyy-mm-dd)} :: {time (24h - hh:mm)} :: {link (optional)} - Creates an event

!listEvents - Lists all events, showing ids, names, locations, and date/time

!getEvent {id} - Shows event with id as it will be formatted in the events channel

!updateEvent {id} :: {property1} == {newValue1} :: {property2} == {newValue2} ... - Updates properties in event with id given, can change any number of properties

!deleteEvent {id} - deletes event with id

!forceWeeklyUpdate - forces the bot to make an announcement with the events for the next week (useful if for some reason the weekly update didnt fire as expected)

!forceDailyUpdate - forces the bot to make an announcement with the events for that day (!similar to forceWeeklyUpdate)

!forceHourlyUpdate - forces the bot to make an announcement with the events occuring between 46-60 minutes from the current time
