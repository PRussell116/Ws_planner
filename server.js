const express = require('express');
const webSocket = require('ws');
const http = require('http')
const ip = require("ip");
const mysql = require('mysql2/promise');
const multer = require('multer');
const md5File = require('md5-file/promise');
const fs = require('fs');
const util = require('util');

// default sql connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  charset: 'UTF8MB4',
  database: 'plannerDB'
});

const app = express();
const port = 8080;

// set up websocket server
const server = http.createServer(app);
const wss = new webSocket.Server({
  server: server
});

// when connected to websocked call handler
wss.on('connection', connectionHandler);

// promisify some filesystem functions
fs.unlinkAsync = fs.unlinkAsync || util.promisify(fs.unlink);
fs.renameAsync = fs.renameAsync || util.promisify(fs.rename);

function connectionHandler(ws) {
  console.log("connected");
  // when message from ws recived call msg handler
  ws.on('message', messageHandler)

}
/**
*handles messages sent from the client via websocket by adjusting the database and sending a response
* @param message : json object sent via the websocket can contain vaules :
 method : the method to be carried out e.g delete / save / positions
 element: id of the element / the element to appendto
 weekId : the id of the weeks
 unitId : the id of the unit_t

 *@returns sends a json message back to the client

*/
async function messageHandler(message, res) {
  console.log(message);
  const sql = await connection;


  let msgJson = JSON.parse(message);
  if (msgJson.method == 'delete') {
    // remove unit from DB
    if (msgJson.type == 'unit') {
      // delete the unit (forigen key data items deleted aswell due to cascade delete)
      await sql.query('DELETE FROM Unit WHERE unitId = ' + msgJson.element);

    } else if (msgJson.type == 'week') {
      // remove from DB by Id
      await sql.query('DELETE FROM Week WHERE weekID = ' + msgJson.element);
      const eleId = "week" + msgJson.element; // readd the week part of element to delete from page

      message = JSON.stringify({
        'method': 'delete',
        'element': eleId,
        'unit': msgJson.unit
      });

    } else if (msgJson.type == 'resource') {

      // remove from file system
      await fs.unlinkAsync(`${__dirname}/webpages/resources/` + msgJson.fileName);
      // remove from DB by Id
      await sql.query('DELETE FROM WeekResources WHERE   resourceId = ' + msgJson.element);

      const eleId = "resource" + msgJson.element; // readd the resource part of element to delete from page
      message = JSON.stringify({
        'method': 'delete',
        'type': 'resource',
        'element': eleId,
        'unit': msgJson.unit
      });

    }
  } else if (msgJson.method == 'save') {
    // add to DB
    if (msgJson.type == "unit") {
      await sql.query(sql.format('INSERT INTO Unit VALUES ( NULL,  \"' + msgJson.title + "\" )"));
      let [unitId] = await sql.query('SELECT unitId FROM Unit WHERE unitName LIKE  \"' + msgJson.title + "\" ");
      let newId = unitId[0].unitId;
      message = JSON.stringify({
        'method': 'save',
        'type': "unit",
        'element': msgJson.element,
        'title': msgJson.title,
        'unitId': newId
      });

    } else {
      // data to insert into the database
      const newWeekData = {
        weekName: msgJson.title,
        duration: msgJson.duration,
        unitId: msgJson.unit
      };
      // insert values to db
      await sql.query(sql.format('INSERT INTO Week SET ?;', newWeekData));
      // find id in db to create new id for clientside to use
      let [weekId] = await sql.query('SELECT weekId FROM Week WHERE weekName LIKE  \"' + msgJson.title + "\" ");
      let newId = "week" + weekId[0].weekId; // add week part of id
      message = JSON.stringify({
        'method': 'save',
        'element': msgJson.element,
        'title': msgJson.title,
        'duration': msgJson.duration,
        'unit': msgJson.unit,
        'type': msgJson.type,
        'weekId': newId
      });
    }
    // called from moving
  } else if (msgJson.method == 'position') {
    if (msgJson.type == "moved" || msgJson.type == "add") {
      // +1 position to all records after
      await sql.query('UPDATE Week SET positon = positon + 1 WHERE positon >=   \"' + msgJson.positon + "\" AND unitId = " + msgJson.unitId);
      // change position to new position
      await sql.query('UPDATE Week SET positon = \"' + msgJson.positon + "\" WHERE WeekId = " + msgJson.element); // called after deletion
    } else if (msgJson.type == "delete") {
      // -1 postion from all after the deleted item
      await sql.query('UPDATE Week SET positon = positon - 1 WHERE positon >=   \"' + msgJson.positon + "\" AND unitId = " + msgJson.unitId);
    }
  }
  // forward message to clients to adjust their page
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        // error ignored
      }
    }
  });
}

/** function to get all units from the database

*@param req express request object
*@param req express response object
*@returns units json of the sql query obtained
*/
async function loadUnits(req, res) {
  const sql = await connection;
  try {
    let [units] = await sql.query('SELECT * FROM Unit');
    res.send(units);
  } catch (e) {
    error(res, e);
  }
}
/**
 *function to get all the weeks and resources of a weeks
 *@param req express reqest object containing url with the id of the requested unit_t
 *@param res express response object
 *@returns json object containg the json of all weeks and resources of the unit
 */

async function getUnitContent(req, res) {
  const sql = await connection;

  try {
    // pull the weeks and order by position for client side
    let [weeks] = await sql.query(sql.format('SELECT * FROM Week WHERE unitId LIKE  \"' + req.query.unitId + "\"  ORDER BY positon ASC "));

    //pull the resources for the weeks
    let resources = [];
    // loop though weeks and get the resources of that week
    for (let i = 0; i < weeks.length; i++) {
      let [weekResources] = await sql.query('SELECT * FROM WeekResources WHERE weekId = ' + weeks[i].weekId);
      resources += await weekResources;
    }
    res.json({
      weeks: weeks,
      resources: resources
    });

  } catch (e) {
    error(res, e);
  }

}
/** function to get all the resouices based on a week
 *@param req express request object containing the weekID
 *@param res express response object
 *@returns all the resources of the week in json
 */

async function getResources(req, res) {

  const sql = await connection;
  try {

    //pull the resources for the weeks
    let [weekResources] = await sql.query('SELECT * FROM WeekResources WHERE weekId = ' + req.query.weekId);
    res.json(weekResources);

  } catch (e) {
    error(res, e);
  }
}

// configure multer to use uploads folder, limit the file size, and only use 1 file at a time
const configedMult = multer({
  "dest": "uploads/",

  "limits": {
    "fields": 10,
    "fileSize": 104800000000,
    "files": 1

  }
});
const single = configedMult.single('md5me');

/** function to handle file uploads to the Server
 *@param req express request object containing the file
 *@param res express response object
 *@returns one of status codes : 413 , 500, 200
 */
async function upload(req, res) {


  single(req, res, async (error) => {
    if (error) {
      // if reaches limit configured above
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(413).send('Request Entity Too Large');
      } else {
        res.status(500).send('Server Error');
      }
      return;
    }
    // save the file in the uploads folder
    await fs.renameAsync(req.file.path, `${__dirname}/webpages/resources/` + req.file.originalname);

    // sql to insert
    const sql = await connection;
    const resourceSet = {
      weekId: req.query.element,
      fileName: req.file.originalname

    }
    // insert the file details into the DB
    await sql.query(sql.format('INSERT INTO WeekResources SET ?;', resourceSet));
    res.sendStatus(200);
  });
}
// log errors
function error(res, msg) {
  res.sendStatus(500);
  console.error(msg);
}
// use static pages
app.use(express.static(`${__dirname}/webpages`));

app.post('/upload', upload);
app.get('/unit', loadUnits);
app.get('/unitContent', getUnitContent);
app.get('/resources', getResources);

server.listen(port, () => {
  console.log('Server started:', `http://${ip.address()}:${port}`)
});
