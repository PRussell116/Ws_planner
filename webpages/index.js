'use strict';
console.log("connected");


window.addEventListener('load', init);
let ws = new WebSocket("ws://" + window.location.hostname + ":" + (
window.location.port || 80) + "/");
ws.addEventListener("message", recivedMessageFromServer);

async function init() {

  document.getElementById('unitAdd').addEventListener('click',addUnitInputs);

  await loadUnits();

  console.log("init");
  const unitBlock = document.querySelectorAll('unitBlock');

  // add drag + drop handlers for blocks
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
// add the units to the page using template and json from DB
function putUnitsInPage(units) {
  const template = document.querySelector('#unit_t');
  for (let i = 0; i < units.length; i++) {
    let newEl = document.importNode(template.content, true).children[0];
    let newElA = newEl.querySelector('.unitLink');
    newElA.innerText = units[i].unitName;
    newElA.addEventListener('click', unitClickHandler);

    // put the unit id in hidden p
    newEl.querySelector('.hidden').innerText = units[i].unitId;
    newEl.querySelector('.delete').addEventListener('click', deleteUnit);

    document.getElementById('unitsBar').appendChild(newEl);
  }
}

// create elements to input new unit
function addUnitInputs(e){
  // remove listner for multi clicks
  document.getElementById('unitAdd').removeEventListener('click',addUnitInputs);
  const template = document.querySelector('#unitInput_t');
  let newEl = document.importNode(template.content, true).children[0];
  newEl.setAttribute('id','addUnitBox');
  newEl.querySelector('input').setAttribute('id',"unitNameBox");
  newEl.querySelector('.save').addEventListener('click',saveUnit);
  newEl.querySelector('.cancel').addEventListener('click',cancelUnit);
  document.getElementById('unitsBar').appendChild(newEl);
}
function saveUnit(e){
  const unitName = document.getElementById('unitNameBox').value;
  // send save to WS, (elment always nav bar)
    ws.send(JSON.stringify({'method': 'save','type': 'unit', 'element': "unitsBar", 'title': unitName}));
  // readd listner + delete box
  cancelUnit(e);
}

function cancelUnit(e){
  // readd listner
  document.getElementById('unitAdd').addEventListener('click',addUnitInputs);

  document.getElementById('addUnitBox').remove();

}

function deleteUnit(e) {
  let eleToDelete = this.parentNode
  eleToDelete.remove();
  let delId = eleToDelete.querySelector('p').innerText; // get id held in p

  const unit = document.getElementById('currentUnitId').textContent;

  // send Delete event to server
  ws.send(JSON.stringify({'method': 'delete', 'element': delId, 'type': 'unit', 'unit': unit}));
}

function deleteElement(eleID) {
  document.getElementById(eleID).remove();
}

// send request for a unit's contents then call function to put in page
async function unitClickHandler(e) {
  const unitId = this.parentNode.querySelector('.hidden').textContent;
  document.getElementById('currentUnitId').textContent = unitId;
  document.getElementById('currentUnit').innerText = this.textContent;

  let unitContentJson = await fetch('/unitContent/?unitId=' + unitId);
  putUnitContentInPage(await unitContentJson.json());
}

function putUnitContentInPage(content) {
  // delete old weeks
  let delWeeks = document.querySelectorAll('.week')
  delWeeks.forEach((week) => {
    week.remove();
  });
  // add new weeks
  let newWeeks = content.weeks
  let tempWeek = document.createElement('li');
  tempWeek.setAttribute('id', 'tempWeek');
  tempWeek.classList.add("week");
  tempWeek.innerText = "Add a week to the new unit ";
  document.getElementById("weeks").appendChild(tempWeek);

  //





  let tempPlus = document.createElement('a');
  tempPlus.innerText = "+";
  tempPlus.setAttribute('id',"tempPlus");
  tempWeek.appendChild(tempPlus);

  for (let i = 0; i < newWeeks.length; i++) {
    let newId = "week" + newWeeks[i].weekId;
    let weekToAddTo = "";
    if(i == 0){
      weekToAddTo = "tempWeek"
    }else{
      weekToAddTo = "week" + newWeeks[i-1].weekId;
    }
    addWeekToPage(weekToAddTo, newWeeks[i].weekName, newWeeks[i].duration, newId);
    getResources(newWeeks[i].weekId);


  }

  // only contains tempWeek
  if(document.getElementById('weeks').children.length == 1){
  //  tempWeek.classList.add('hidden');
      tempPlus.addEventListener('click',addWeekInputs);
    // make a hidden week
  }else{
    tempWeek.remove();
  }

}

function deleteWeek(e) {
  console.log("delete event start")
  selectedEle = this;

  let confirmBoxContain = document.createElement("section");
  confirmBoxContain.setAttribute("class", "decisonContainer");

  let yesBox = document.createElement("p");
  yesBox.innerText = "yes"
  yesBox.setAttribute("class", "decisonBox");

  let noBox = document.createElement("p");
  noBox.innerText = "no"
  noBox.setAttribute("class", "decisonBox");

  confirmBoxContain.appendChild(yesBox);
  confirmBoxContain.appendChild(noBox);

  yesBox.addEventListener('click', yesNoHandler);
  noBox.addEventListener('click', yesNoHandler);

  this.parentNode.appendChild(confirmBoxContain);

  selectedEle.removeEventListener('click', deleteWeek);
}


function addWeekInputs(e) {

  console.log("add week event started");

  let addBox = document.createElement('article');

  let weekToAddTo = document.createElement('p');
  weekToAddTo.innerText = this.parentNode.id; // gets the week
  weekToAddTo.setAttribute('id', "weekAdd");

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
  durationBox.innerText = "duration";
  durationBox.setAttribute('id', "duration");

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

function addWeekToPage(prevEle, title, duration, weekId) {

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
  resourceUL.setAttribute('id',"resourceUL" + weekId);
  resourceUL.addEventListener('drop',resourceDropHandler);

  addDragDropHandlers(newEl);
  const newId = "week" + weekId;
  newEl.setAttribute('id', weekId);

  document.getElementById(prevEle).insertAdjacentElement('afterEnd', newEl);
  // do something with duration

  if(prevEle == "tempWeek"){
    document.getElementById("tempWeek").remove();
  }
  // tell server to update positions
  updatePositon(newEl,"add");
}


async function getResources(eleToAppend){
  let resources = await fetch('/resources/?weekId=' + eleToAppend);
  putResourcesInPage(eleToAppend,await resources.json());

}
function putResourcesInPage(eleToAppend,resources){
  // delete old resources



  let ulToAppend = document.getElementById("week" + eleToAppend).querySelector('ul');
  while(ulToAppend.firstChild){
    ulToAppend.removeChild(ulToAppend.firstChild);

  }

  for(let i =0;i<resources.length;i++){
    const newResc = document.createElement('li');
    newResc.innerText = resources[i].fileName;
    newResc.classList.add('resource');
    newResc.download = resources[i].file;

    ulToAppend.appendChild(newResc);
  }

}


function saveHandler(e) {
  // get content from boxes
  let weekToAddTo = document.getElementById('weekAdd');
  let title = document.getElementById('titleBox').value;
  let duration = document.getElementById('duration').value;
  let unit = document.getElementById('currentUnitId').textContent;
  ws.send(JSON.stringify({'method': 'save','type':'week', 'element': weekToAddTo.innerText, 'title': title, 'duration': duration, 'unit': unit}));

  document.getElementById('addWeekBox').remove();
  // re-add the event listener to the + button
  document.getElementById(weekToAddTo.innerText).querySelector('.add').addEventListener('click', addWeekInputs);

}

// after clicking cancel the box is removed
function cancelHandler(e) {
  document.getElementById('addWeekBox').remove();
}

function yesNoHandler(e) {
  selectedEle = this;
  let elementToDelete = selectedEle.parentNode.parentNode;
  let type = "";
  let delId = "";
  if (elementToDelete.classList.contains("week")) {
    type = "week";
    delId = elementToDelete.getAttribute('id').slice(4); // remove week part from id e.g week24 -> 24
    console.log("del Id: " + delId);
  } else if (elementToDelete.classList.contains("resource")) {
    type = "resource";
    delId = elementToDelete.getAttribute('id').slice(8); // remove resource part from id e.g resource24 -> 24
    console.log("del Id: " + delId);
  }
  const unit = document.getElementById('currentUnitId').textContent;
  if (selectedEle.innerText == "yes") {
    if(elementToDelete.classList.contains("week")){
      // tell server to update positions
      updatePositon(elementToDelete,"delete");
    }
    // tell server to delete

    ws.send(JSON.stringify({'method': 'delete', 'element': delId, 'type': type, 'unit': unit}));
  } else {
    // delete the yes / no box
    elementToDelete.querySelector(".delete").addEventListener('click', deleteWeek); // readd event listner to delete button
    elementToDelete.removeChild(selectedEle.parentNode); // delete the yes / no box container when done

  }
}

async function recivedMessageFromServer(e) {
  console.log("message recived");
  const recived = JSON.parse(e.data);
  if(recived.type == "unit" && recived.method == "save"){
    console.log("it worked");
    const newUnitJson = [{'unitName':recived.title,'unitId':recived.unitId}]
    putUnitsInPage(newUnitJson);
  }


  // prevent adding to wrong pages

  if (recived.unit == document.getElementById('currentUnitId').textContent) {

    if (recived.method == "delete" && recived.type != "unit") {
      deleteElement(recived.element);
    }


    else if (recived.method == "save") {
        console.log("reached line 284");
        if(recived.type == "week"){
            addWeekToPage(recived.element, recived.title, recived.duration, recived.weekId);
        }
        else if (recived.type == "resource") {
          addResourceToPage(recived.element,recived.fileData);

        }
    }
  }
}

// type can be moved/added/deleted
function updatePositon(week,type){
  let weeksList = document.getElementById('weeks').children;
  let weekId = week.id.slice(4); // remove weekpart of id e.g week24 -> 24
  let newPos = 0;
  const unitId = document.getElementById('currentUnitId').textContent;
  for(newPos;newPos<weeksList.length;newPos++){
    if(weeksList[newPos] == week){
      break;
    }

  }
  console.log("newPos: " + newPos);
  // send to msg server to tell new pos + update pos of ones below
  ws.send(JSON.stringify({'method': 'position','element': weekId, 'positon':newPos + 1,'type':type,'unitId': unitId}));
}

let selectedEle = null;

/*

    Drag and drop handlers 👇



*/

function handleDragStart(e) {
  selectedEle = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
  this.classList.add('dragElem')

}
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  this.classList.add('over');

  e.dataTransfer.dropEffect = 'move';
  return false;

}
function handleDragLeave(e) {
  this.classList.remove('over');

}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (selectedEle != this) {
    this.parentNode.removeChild(selectedEle)
    let dropHTML = e.dataTransfer.getData('text/html');
    this.insertAdjacentHTML('beforeBegin', dropHTML);
    let dropElem = this.previousSibling;
    let innerDeletes = dropElem.getElementsByClassName('delete');
    // readd event listners
    for (let i = 0; i < innerDeletes.length; i++) {
      innerDeletes[i].addEventListener('click', deleteWeek);
    }
    addDragDropHandlers(dropElem);

    // function to update positions of elements in DB
    updatePositon(dropElem,"moved");


  }
  this.classList.remove('over');
  return false;

}

function handleDragEnd(e) {
  this.classList.remove('over');

}


async function resourceDropHandler(e){
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
    opts.body.append(`md5me`,file,file.name);
    const response = await fetch('/upload?element='+ elementId,opts);
    if(response.ok){
      // put in page
      getResources(elementId);
    }else{
      // show error html
      console.log("eror")
    }

  }
  this.classList.remove('over');
}

    // // instantiate a new FileReader object
    // let fileBod = newFormData();
    // fileBod.append('md5me',file,file.name);
    //   // send the file over web sockets
    //   console.log(fr.result);
    //  ws.send(JSON.stringify({'method': 'save','type': 'resource', 'element': elementId,'unit': unit, 'fileData':fileBod}));
    //
    // }



// ws.send(JSON.stringify({'method': 'save','type': 'unit', 'element': "unitsBar", 'title': unitName}));

function addDragDropHandlers(elem) {
  elem.addEventListener('dragstart', handleDragStart, false);
  elem.addEventListener('dragover', handleDragOver, false);
  elem.addEventListener('dragleave', handleDragLeave, false);
  elem.addEventListener('drop', handleDrop, false);
  elem.addEventListener('dragend', handleDragEnd, false);
}
