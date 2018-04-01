'use strict';
console.log("connected");

window.addEventListener('load', init);
// create websocket
let ws = new WebSocket("ws://" + window.location.hostname + ":" + (
  window.location.port || 80) + "/");
ws.addEventListener("message", recivedMessageFromServer);

/* initialisation function that calls other functions and adds listners */

async function init() {

  document.getElementById('unitAdd').addEventListener('click', addUnitInputs);

  // load the units from DB
  await loadUnits();

  console.log("init");

  // add drag + drop handlers for weeks
  let weeks = document.querySelectorAll('#weeks .week');
  [].forEach.call(weeks, addDragDropHandlers);
  // listners to delete buttons
  const deleteButts = document.getElementsByClassName('delete');
  for (let i = 0; i < deleteButts.length; i++) {
    deleteButts[i].addEventListener('click', deleteWeek);
  }
  // listeners to add buttons
  const addButts = document.getElementsByClassName('add');
  for (let i = 0; i < addButts.length; i++) {
    addButts[i].addEventListener('click', addWeekInputs);
  }
}
// get json of the units from DB then call funct to put them in page
async function loadUnits() {
  let unitJson = await fetch('/unit');
  putUnitsInPage(await unitJson.json());
}
/** add the units to the page using template and json from DB
 * @param units json object contaning the units and thier vaules
 */
function putUnitsInPage(units) {
  // use template and then add listners
  const template = document.querySelector('#unit_t');
  for (let i = 0; i < units.length; i++) {
    let newEl = document.importNode(template.content, true).children[0];
    let newElA = newEl.querySelector('.unitLink');
    newElA.innerText = units[i].unitName;
    newElA.addEventListener('click', unitClickHandler);

    // put the unit id in hidden p
    newEl.querySelector('.hidden').innerText = units[i].unitId;
    newEl.querySelector('.delete').addEventListener('click', deleteUnit);

    // append to the navbar
    document.getElementById('unitsBar').appendChild(newEl);
  }
}

/** create elements to input new unit
 *@param e click event called after clicking a + button
 */
function addUnitInputs(e) {
  // remove listner for multi clicks
  document.getElementById('unitAdd').removeEventListener('click', addUnitInputs);
  // use template then add listners + ids
  const template = document.querySelector('#unitInput_t');
  let newEl = document.importNode(template.content, true).children[0];
  newEl.setAttribute('id', 'addUnitBox');
  newEl.querySelector('input').setAttribute('id', "unitNameBox");
  newEl.querySelector('.save').addEventListener('click', saveUnit);
  newEl.querySelector('.cancel').addEventListener('click', cancelUnit);
  document.getElementById('unitsBar').appendChild(newEl);
}
/** function to send message to websocket to save a unit with the vaules from input boxes
 *@param e click event called from pressing the save button
 */
function saveUnit(e) {
  const unitName = document.getElementById('unitNameBox').value;
  // send save to WS, (elment always nav bar)
  ws.send(JSON.stringify({
    'method': 'save',
    'type': 'unit',
    'element': "unitsBar",
    'title': unitName
  }));
  // call cancel unit to readd the event lisnter to the + and remove input boxes
  cancelUnit(e);
}
/** function to cancel creating a unit removes the boxes and readds event listner removed from +
 *@param e click event from clicking cancel button
 */

/**
 *function to remove boxes created by creating a unit and to readd listeners
 *@param e click event from clicking on the cancel button
 */
function cancelUnit(e) {
  // readd listner
  document.getElementById('unitAdd').addEventListener('click', addUnitInputs);
  // delete input boxes
  document.getElementById('addUnitBox').remove();

}

/** function to delete a unit sends message to websocket to remove from DB + forward msgJson
 *@param e click event from clicking the X of a unit
 */
function deleteUnit(e) {
  let eleToDelete = this.parentNode // the unit box
  eleToDelete.remove();
  let delId = eleToDelete.querySelector('p').innerText; // get id held in p

  const unit = document.getElementById('currentUnitId').textContent; // find unit id

  // send Delete event to server
  ws.send(JSON.stringify({
    'method': 'delete',
    'element': delId,
    'type': 'unit',
    'unit': unit
  }));
}

/** send request for a unit's contents then call function to put in page
 * @param e click even on an unit box
 */
async function unitClickHandler(e) {
  // remove possible inputbox
  const addWeekBox = document.getElementById('addWeekBox')
  if(addWeekBox != null) addWeekBox.remove();


  const unitId = this.parentNode.querySelector('.hidden').textContent;
  // change values in current unit boxes
  document.getElementById('currentUnitId').textContent = unitId;
  document.getElementById('currentUnit').innerText = this.textContent;

  // fetch unit content
  let unitContentJson = await fetch('/unitContent/?unitId=' + unitId);
  putUnitContentInPage(await unitContentJson.json());
}
/* put the json of a unit's content in the pages
 * @param content json object containing the weeks of a unit and the resources of those weeks
 */
function putUnitContentInPage(content) {
  // delete old weeks
  let delWeeks = document.querySelectorAll('.week')
  delWeeks.forEach((week) => {
    week.remove();
  });
  // add new weeks
  let newWeeks = content.weeks
  let tempWeek = document.createElement('li');
  // create a temporary week to append to, if there is no content found for the week temp week becomes place holder
  tempWeek.setAttribute('id', 'tempWeek');
  tempWeek.classList.add("week");
  tempWeek.innerText = "Add a week to the new unit ";
  document.getElementById("weeks").appendChild(tempWeek);

  let tempPlus = document.createElement('a');
  // create large + to make it clear where to add content
  tempPlus.innerText = "+";
  tempPlus.setAttribute('id', "tempPlus");
  tempWeek.appendChild(tempPlus);

  for (let i = 0; i < newWeeks.length; i++) {
    // create the ids
    let newId = "week" + newWeeks[i].weekId;
    let weekToAddTo = "";
    // if only temp week append to it else append to last week
    if (i == 0) {
      weekToAddTo = "tempWeek"
    } else {
      weekToAddTo = "week" + newWeeks[i - 1].weekId;
    }
    // add the week to the page
    addWeekToPage(weekToAddTo, newWeeks[i].weekName, newWeeks[i].duration, newId);
    // add the week's resources
    getResources(newWeeks[i].weekId);

  }

  // only contains tempWeek
  if (document.getElementById('weeks').children.length == 1) {
    tempPlus.addEventListener('click', addWeekInputs);
    // if temp week not only week anymore remove temp week
  } else {
    tempWeek.remove();
  }

}
/**
 * function to create yes no boxes after clicking to delete a weeks
 *@param e click event from clicking an X of a week
 */
function deleteWeek(e) {
  console.log("delete event start")
  selectedEle = this;
  // container
  let confirmBoxContain = document.createElement("section");
  confirmBoxContain.setAttribute("class", "decisonContainer");
  confirmBoxContain.innerText = "Are you sure you want to delete this?"

  // yes box
  let yesBox = document.createElement("p");
  yesBox.innerText = "Yes"
  yesBox.setAttribute("class", "decisonBox");

  //no box
  let noBox = document.createElement("p");
  noBox.innerText = "No"
  noBox.setAttribute("class", "decisonBox");

  confirmBoxContain.appendChild(yesBox);
  confirmBoxContain.appendChild(noBox);

  yesBox.addEventListener('click', yesNoHandler);
  noBox.addEventListener('click', yesNoHandler);

  this.parentNode.appendChild(confirmBoxContain);

  selectedEle.removeEventListener('click', deleteWeek);
}

/**
 * function to create input boxes after clicking to add a week
 *@param e click event from clicking a + button of a week
 */

function addWeekInputs(e) {

  console.log("add week event started");

  let addBox = document.createElement('article');

  let weekToAddTo = document.createElement('p');
  weekToAddTo.innerText = this.parentNode.id; // gets the week
  weekToAddTo.setAttribute('id', "weekAdd");

  // title of week input
  let weekTitleBox = document.createElement('input');
  weekTitleBox.type = "text";
  weekTitleBox.innerText = "week title";
  weekTitleBox.setAttribute('id', "titleBox");

  let weekTitleText = document.createElement('p');
  weekTitleText.innerText = "Title:"

  let durationText = document.createElement('p')
  durationText.innerText = "Duration:"

  let durationBox = document.createElement('input');
  durationBox.type = "number";
  durationBox.min = "1";
  durationBox.innerText = "duration";
  durationBox.setAttribute('id', "duration");

  // save and cancel buttons

  let saveBox = document.createElement('p')
  saveBox.classList.add('save');
  saveBox.innerText = "Save";
  saveBox.addEventListener('click', saveHandler);

  let cancelBox = document.createElement('p');
  cancelBox.classList.add('cancel');
  cancelBox.innerText = "cancel";
  cancelBox.addEventListener('click', cancelHandler);

  addBox.appendChild(weekToAddTo);
  addBox.appendChild(weekTitleText);
  addBox.appendChild(weekTitleBox);
  addBox.appendChild(durationText);
  addBox.appendChild(durationBox);
  addBox.appendChild(saveBox);
  addBox.appendChild(cancelBox);
  addBox.setAttribute('id', "addWeekBox");

  document.querySelector('.wrapper').appendChild(addBox);
  this.removeEventListener('click', addWeekInputs);

}

/**
 *function to add the week to the page, called after reciving save week message from webSocket
 *@param prevEle the id of the element above where the new week would be
 *@param title the string title of the week
 *@param duration integer for the duration of the week
 *@param weekId the id of the week that is being added to the page
 */

function addWeekToPage(prevEle, title, duration, weekId) {

  // use template and add lisnters (clicks and drops)
  const template = document.querySelector('#week_t');
  const newEl = document.importNode(template.content, true).children[0];

  newEl.querySelectorAll('.delete').forEach((button) => {
    button.addEventListener('click', deleteWeek);
  });

  newEl.querySelectorAll('.add').forEach((button) => {
    button.addEventListener('click', addWeekInputs);
  });

  newEl.querySelector('details > summary').innerText = title;

  let resourceUL = newEl.querySelector('#resourceUL');
  resourceUL.setAttribute('id', "resourceUL" + weekId);
  resourceUL.addEventListener('drop', resourceDropHandler);

  addDragDropHandlers(newEl);
  const newId = "week" + weekId;
  newEl.setAttribute('id', weekId);

  // append after the week that had the + clicked
  document.getElementById(prevEle).insertAdjacentElement('afterEnd', newEl);
  // do something with duration

  // temp week only exists if its the only week
  if (prevEle == "tempWeek") {
    document.getElementById("tempWeek").remove();
  }
  // tell server to update positions
  updatePositon(newEl, "add");
}


/**
 *function to get all the resouces of a week from the Server
 *@param eleToAppend the id of the week that resources are being added to
 */

async function getResources(eleToAppend) {
  let resources = await fetch('/resources/?weekId=' + eleToAppend);
  putResourcesInPage(eleToAppend, await resources.json());

}
/**
 *function to append the resources from the server to a weeks
 *@param eleToAppend id of the week that is being appended to
 *@param resources json object containg the values of the resouces, i.e file names and ids
 */
function putResourcesInPage(eleToAppend, resources) {
  // delete old resources
  let ulToAppend = document.getElementById("week" + eleToAppend).querySelector('ul');
  while (ulToAppend.firstChild) {
    ulToAppend.removeChild(ulToAppend.firstChild);

  }
  const dropHelper = document.createElement('li');
  dropHelper.innerText = "Drop resources here!";
  ulToAppend.appendChild(dropHelper);

  // loop through json and make element for each
  for (let i = 0; i < resources.length; i++) {
    const newResc = document.createElement('li');
    newResc.classList.add('resource');

    const newRescA = document.createElement('a');
    newRescA.innerText = resources[i].fileName;

    // refrences files in the resources folder
    newRescA.setAttribute('href', "/resources/" + resources[i].fileName);
    // when clicking will download file
    newRescA.download = "/resources/" + resources[i].fileName;
    newResc.appendChild(newRescA);


    ulToAppend.appendChild(newResc);
  }

}
/**
 *function to send save message to websocket after cliking the save buttons
 *@param e click event from clicking on the save buttton
 */

function saveHandler(e) {
  // get content from boxes
  let weekToAddTo = document.getElementById('weekAdd');
  let title = document.getElementById('titleBox').value;
  let duration = document.getElementById('duration').value;
  let unit = document.getElementById('currentUnitId').textContent;
  // send save week message to WS using pulled values
  ws.send(JSON.stringify({
    'method': 'save',
    'type': 'week',
    'element': weekToAddTo.innerText,
    'title': title,
    'duration': duration,
    'unit': unit
  }));
  // remove input boxes after save
  document.getElementById('addWeekBox').remove();
  // re-add the event listener to the + button, was removed to prevent double save
  document.getElementById(weekToAddTo.innerText).querySelector('.add').addEventListener('click', addWeekInputs);

}
/**
 *function to remove the add week box after clicking cancelBox
 *@param e click event called after clicking the cancel button
 */
function cancelHandler(e) {
  // readd listner to +
  let week = document.getElementById('weekAdd').innerText;
  document.getElementById(week).querySelector('.add').addEventListener('click',addWeekInputs);


  document.getElementById('addWeekBox').remove();
}

/**
 *function that handles clicks on the 'are you sure?' box when attempting to delete something, if yes send delete message to WS else delete the yes/no boxes
 *@param e click event on either the yes button or no button of the are you sure box
 */

function yesNoHandler(e) {
  selectedEle = this;
  // 1st element outside of the yes/no that was added
  let elementToDelete = selectedEle.parentNode.parentNode;
  let type = "";
  let delId = "";
  if (elementToDelete.classList.contains("week")) {
    type = "week";
    delId = elementToDelete.getAttribute('id').slice(4); // remove week part from id e.g week24 -> 24
  } else if (elementToDelete.classList.contains("resource")) {
    type = "resource";
    delId = elementToDelete.getAttribute('id').slice(8); // remove resource part from id e.g resource24 -> 24
  }
  // find what unit the week was a part of
  const unit = document.getElementById('currentUnitId').textContent;
  if (selectedEle.innerText == "Yes") {
    if (elementToDelete.classList.contains("week")) {
      // tell server to update positions
      updatePositon(elementToDelete, "delete");
    }
    // tell server to delete
    ws.send(JSON.stringify({
      'method': 'delete',
      'element': delId,
      'type': type,
      'unit': unit
    }));
  } else {
    // delete the yes / no box
    elementToDelete.querySelector(".delete").addEventListener('click', deleteWeek); // readd event listner to delete button
    elementToDelete.removeChild(selectedEle.parentNode); // delete the yes / no box container when done

  }
}
/**
 *function that handles messages from the server by calling other functions
 *@param e message recived from websocket event
 */

function recivedMessageFromServer(e) {
  // read json sent from server
  const recived = JSON.parse(e.data);
  // if want to save a unit
  if (recived.type == "unit" && recived.method == "save") {
    const newUnitJson = [{
      'unitName': recived.title,
      'unitId': recived.unitId
    }]
    putUnitsInPage(newUnitJson);
  }

  // prevent adding to wrong pages, by checking what unit page you are on

  if (recived.unit == document.getElementById('currentUnitId').textContent) {

    // if deleting
    if (recived.method == "delete" && recived.type != "unit") {
      document.getElementById(recived.element).remove();



      // if saving
    } else if (recived.method == "save") {
      if (recived.type == "week") {
        addWeekToPage(recived.element, recived.title, recived.duration, recived.weekId);
        console.log(recived);

      } else if (recived.type == "resource") {
        addResourceToPage(recived.element, recived.fileData);

      }
    }
  }
}


/**
 *function update the position of a week after adding/deleting/moving by sending message to WS
 *@param week the element of the week that has been operated on
 *@param type string syaying what type of update needs to be carried out i.e week moved / week  added / week deleted
 */
function updatePositon(week, type) {
  let weeksList = document.getElementById('weeks').children; // all the weeks
  let weekId = week.id.slice(4); // remove weekpart of id e.g week24 -> 24
  let newPos = 0;
  const unitId = document.getElementById('currentUnitId').textContent;
  // loop though weeks to find where the week is now
  for (newPos; newPos < weeksList.length; newPos++) {
    if (weeksList[newPos] == week) {
      break;
    }

  }
  // send to msg server to tell new pos + update pos of ones below
  ws.send(JSON.stringify({
    'method': 'position',
    'element': weekId,
    'positon': newPos + 1,
    'type': type,
    'unitId': unitId
  }));
}


/*

    Drag and drop handlers 👇



*/
let selectedEle = null;

/**
 *function that handles drag start
 *@param e dragstart event
 */
function handleDragStart(e) {
  selectedEle = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
  this.classList.add('dragElem')

}
/**
 *function that handles dragging over a drop zone
 *@param e dragOver event
 */
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  // change the class to make it clear to drop
  this.classList.add('over');

  e.dataTransfer.dropEffect = 'move';
  return false;

}
/**
 *function that removes the class over when no longer over the zone
 *@param e dragleave event
 */
function handleDragLeave(e) {
  this.classList.remove('over');

}

/**
 *function that handles dropping of weeks within the week block area
 *@param e drop event
 */
function handleDrop(e) {
  // prevent dropping of files
  if (e.dataTransfer.files.length > 0) return;
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  // only works if a different week is being dropped
  if (selectedEle != this) {
    this.parentNode.removeChild(selectedEle)
    // transfer all the html
    let dropHTML = e.dataTransfer.getData('text/html');
    this.insertAdjacentHTML('beforeBegin', dropHTML);
    let dropElem = this.previousSibling;
    let innerDeletes = dropElem.getElementsByClassName('delete');
    // readd delete event listners
    for (let i = 0; i < innerDeletes.length; i++) {
      innerDeletes[i].addEventListener('click', deleteWeek);
    }

    let innerAdds = dropElem.getElementsByClassName('add');
    // readd add event listners
    for (let i = 0; i < innerAdds.length; i++) {
      innerAdds[i].addEventListener('click', addWeekInputs);
    }
    // readd week drag and drop listners
    addDragDropHandlers(dropElem);

    //update positions of elements in DB
    updatePositon(dropElem, "moved");

  }
  this.classList.remove('over');
  return false;

}
/**
 *function that removes the class over when the drag is over
 *@param e dragend event
 */
function handleDragEnd(e) {
  this.classList.remove('over');

}
/**
 *function to handle the dropping of files into the resource details section
 *@param e drog even when dropping files into the correct section
 */

async function resourceDropHandler(e) {
  // remove over class from the week
  this.parentNode.parentNode.classList.remove('over');
  // get the id of week being dropped into (remove week part of id e.g week24 ->24);
  const elementId = this.parentNode.parentNode.id.slice(4);
  const unit = document.getElementById('currentUnitId').textContent;
  e.preventDefault();
  // iterate over the files dragged on to the browser
  for (const file of e.dataTransfer.files) {
    let opts = {
      method: 'POST',
      body: new FormData()
    };
    opts.body.append(`md5me`, file, file.name);
    const response = await fetch('/upload?element=' + elementId, opts);
    if (response.ok) {
      // put in page
      getResources(elementId);
    } else {
      // show error html
      console.log("eror")
    }
  }

}
/**
 *function to add all the drag and drop handlers to weeks
 *@param elem week element
 */

function addDragDropHandlers(elem) {
  elem.addEventListener('dragstart', handleDragStart, false);
  elem.addEventListener('dragover', handleDragOver, false);
  elem.addEventListener('dragleave', handleDragLeave, false);
  elem.addEventListener('drop', handleDrop, false);
  elem.addEventListener('dragend', handleDragEnd, false);
}
