
# Ws_Planner

Webscript unit planning web app


### Installing


1) Install packages

```
npm install
```

2) Create database

```
mysql -root -p
```

2.5) Create tables and insert the data

```
Copy and paste content from  Ws_planner/database/unitDBInit.sql 
```
3) Start the server

```
cd back to Ws_planner

npm start
```

4) go to ip address and use the app

Note : -No files in resources folder to start with, 
-if password for user root in mysql is not root it will not work, either change password to 
root or change the password param in the server file to the correct password

## Features of Ws_planner
```
Creation and deletion of units
```
```
Creation and deletion of weeks (weeks can be made/deleted from any position)
```
```
Collaborative editiong through the use of websockets
```
```
Drag and drop to reorder weeks, order is saved after reload
```
```
Drag and drop to upload files to weeks
```
```
Deletion of files uploaded to weeks
```

### Possible future features of Ws_planner

Improved database maintainability
```
Scripts to create the tables, insert dummy data, and remove dummy data
```

Better representation of duration
```
Week boxes appear longer based on their duration
```

Units are tied to accounts

```
Using google auth for accounts

A unit is connected to an account and can only be viewed by that person and whoever 
they share it with


Units can be shared to other users via links
```

Improved accessability

```
Drag and drop can be done via the use of keyboard shortcuts
```

## Reflection

Looking back at the past year by far the most useful weeks to this project were DOM and Jstergram as they 
provided the basic building blocks for the app.


When I was creating the application I spent too much time trying to get the file upload to work
at first I was trying to convert the files into binary and then store them in the database as a blob.
However I have now learnt that that is not the point of the database I should of been using FS to store the files.

When creating this coursework I had to futher my knowledge of websockets as we only had one week on them
and I wanted my applcation to be collaborative. However if I had a little more time I would rewrite the file upload
using websockets because with how it its written now someone could upload a file and it would not appear to the 
other clients if they were looking at the resources unless they reopen the drop down.

I also learnt about the use of html5 templates, they saved me alot of time and code when creating the elements but
I learnt about them a little late into the project so not all of my functions that create elements use them, with a little more time
I would rewrite those functions that do not use them as it would improve code readability by quite alot

When I was designing the system I wanted it to do as little as possible on the server side and therefore do most stuff on 
the client side. The app as it is pretty much follows this idea with as little processing server side as possible, however
the amount of serverside processing could be reduced for the way positiong works because as it is now whenever a postion message 
is send from the websocket all the records have to be updated that were after the week that the message came from which would mean
alot of processing in a unit with alot of weeks. As a year can only have 52 weeks its not too many weeks to update but someone could
add more weeks than there are in a year. So overall the way positioning should probably be changed either to to prevent how many weeks 
can be added or how the numbers are being manipulated to reduce server side processing.

If I were to do this project again I would not start with the drag and drop + css again, instead I would focus on getting 
the backend functionally to work first this is because the drag and drop + css took me a long time when the project first 
started. The reason why it took so long was beacuse my css skills were quite rusty and I had never done drag and drop before
whereas all the backend stuff was fresh in my mind meaning I could have got alot more done at the start.


Overall I am happy with how the application turned out but there is alot of room from improvement and areas
where the application can be extended.





