
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
