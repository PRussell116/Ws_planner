const express = require('express');
const webSocket = require('ws');
const http = require('http')
const ip = require("ip");
const mysql = require('mysql2/promise');

const connection = mysql.createConnection({host: 'localhost', user: 'root', password: 'root', charset: 'UTF8MB4', database: 'plannerDB'});

const app = express();
const port = 8080;

const server = http.createServer(app);
const wss = new webSocket.Server({server: server});

wss.on('connection', connectionHandler);

function connectionHandler(ws) {
  console.log("connected");
  ws.on('message', messageHandler)

}
async function messageHandler(message, res) {
  const sql = await connection;

  console.log('received: %s', message);
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
      console.log("eleid" + eleId);
      console.log("unit" + msgJson.unit);
      message = JSON.stringify({'method': 'delete', 'element': eleId, 'unit': msgJson.unit});

    } else if (msgJson.type == 'resource') {
      // remove from DB by Id
      //      await sql.query('DELETE FROM weekResources WHERE   resourceId = ' + msgJson.element);
      const eleId = "resource" + msgJson.element; // readd the resource part of element to delete from page
      message = ({'method': 'delete', 'element': eleId});

    }
  } else if (msgJson.method == 'save') {
    // add to DB
    if (msgJson.type == "unit") {
      await sql.query(sql.format('INSERT INTO Unit VALUES ( NULL,  \"' + msgJson.title + "\" )"));
      let [unitId] = await sql.query('SELECT unitId FROM Unit WHERE unitName LIKE  \"' + msgJson.title + "\" ");
      let newId = unitId[0].unitId;
      message = JSON.stringify({'method': 'save', 'type': "unit", 'element': msgJson.element, 'title': msgJson.title, 'unitId': newId});

    } else {
      const newWeekData = {
        weekName: msgJson.title,
        duration: msgJson.duration,
        unitId: msgJson.unit
      };

      await sql.query(sql.format('INSERT INTO Week SET ?;', newWeekData));
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

  }else if (msgJson.method == 'position') {
    if(msgJson.type == "move" || msgJson.type == "add"){
      // +1 position to all records after
    await sql.query('UPDATE Week SET positon = positon + 1 WHERE positon >=   \"' + msgJson.positon + "\" AND unitId = " + msgJson.unitId);
    // update record
    await sql.query('UPDATE Week SET positon = \"' + msgJson.positon + "\" WHERE WeekId = " + msgJson.element);
    }
    else if(msgJson.type == "delete"){
      // -1 postion from all after the deleted item
      await sql.query('UPDATE Week SET positon = positon - 1 WHERE positon >=   \"' + msgJson.positon + "\" AND unitId = " + msgJson.unitId);
    }







  }

  // forward message to clients chnage as will add when on diff page
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

async function loadUnits(req, res) {
  const sql = await connection;
  try {
    let [units] = await sql.query('SELECT * FROM Unit');
    res.send(units);
  } catch (e) {
    error(res, e);
  }
}

async function getUnitContent(req, res) {
  const sql = await connection;
  console.log("unitId: " + req.query.unitId);
  try {
    // pull the weeks
    let [weeks] = await sql.query(sql.format('SELECT * FROM Week WHERE unitId LIKE  \"' + req.query.unitId + "\"  ORDER BY positon ASC "));

    //pull the resources for the weeks
    let resources = [];
    for (let i = 0; i < weeks.length; i++) {
      let [weekResources] = await sql.query('SELECT * FROM WeekResources WHERE weekId = ' + weeks[i].weekId);
      resources += await weekResources;
    }
    res.json({weeks: weeks, resources: resources});

  } catch (e) {
    error(res, e);
  }

}

function error(res, msg) {
  res.sendStatus(500);
  console.error(msg);
}

app.use(express.static(`${__dirname}/webpages`));
//app.get('/week',loadWeeks);
app.get('/unit', loadUnits);
app.get('/unitContent', getUnitContent);

server.listen(port, () => {
  console.log('Server started:', `http://${ip.address()}:${port}`)
});
