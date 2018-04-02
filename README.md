
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

2.5) Crate tables and insert the data

```
Copy and paste content from  Ws_planner/database/unitDBInit.sql 
```
3) Start the server

```
cd back to Ws_planner

npm start
```

4) go to ip address and use the app

Note : No files in resources folder to start with

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

```
Give an example
```


