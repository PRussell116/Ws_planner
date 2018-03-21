'use strict';
console.log("connected");
window.addEventListener('load', init);
let ws = new WebSocket("ws://" + window.location.hostname + ":" + (window.location.port || 80) + "/");
ws.addEventListener("message",recivedMessageFromServer);


function init() {
  console.log("init");
  const unitBlock = document.querySelectorAll('unitBlock');

  let weeks = document.querySelectorAll('#weeks .week');
  [].forEach.call(weeks, addDragDropHandlers);

  const deleteButts = document.getElementsByClassName('delete');
  for(let i = 0;i<deleteButts.length;i++){
    deleteButts[i].addEventListener('click',deleteWeek);
  }

  const addButts = document.getElementsByClassName('add');
  for(let i = 0;i<addButts.length;i++){
    addButts[i].addEventListener('click',addWeekInputs);
  }


}
function deleteWeek(e){
  console.log("delete event start")
  selectedEle = this;

  let confirmBoxContain = document.createElement("section");
  confirmBoxContain.setAttribute("class","decisonContainer");

  let yesBox = document.createElement("p");
  yesBox.innerText = "yes"
  yesBox.setAttribute("class","decisonBox");

  let noBox = document.createElement("p");
  noBox.innerText = "no"
  noBox.setAttribute("class","decisonBox");

  confirmBoxContain.appendChild(yesBox);
  confirmBoxContain.appendChild(noBox);

   yesBox.addEventListener('click',yesNoHandler);
   noBox.addEventListener('click',yesNoHandler);

  this.parentNode.appendChild(confirmBoxContain);


  selectedEle.removeEventListener('click',deleteWeek);
}


function addWeekInputs(e){
  console.log("add week event started");

  let addBox = document.createElement('article');

  let weekToAddTo = document.createElement('p');
  weekToAddTo.innerText = this.parentNode.id; // gets the week
  weekToAddTo.setAttribute('id',"weekAdd");

  let weekTitleBox = document.createElement('input');
  weekTitleBox.type = "text";
  weekTitleBox.innerText = "week title";
  weekTitleBox.setAttribute('id',"titleBox");

  let weekTitleText = document.createElement('p');
  weekTitleText.innerText = "Title:"


  let durationText = document.createElement('p')
  durationText.innerText = "Duration:"

  let durationBox = document.createElement('input');
  durationBox.type = "number";
  durationBox.innerText = "duration";
  durationBox.setAttribute('id',"duration");

  let saveBox = document.createElement('p')
  saveBox.classList.add('save');
  saveBox.innerText = "Save";
  saveBox.addEventListener('click',saveHandler);

  let cancelBox = document.createElement('p');
  cancelBox.classList.add('cancel');
  cancelBox.innerText = "cancel";
  cancelBox.addEventListener('click',cancelHandler);

  addBox.appendChild(weekToAddTo);
  addBox.appendChild(weekTitleText);
  addBox.appendChild(weekTitleBox);
  addBox.appendChild(durationText);
  addBox.appendChild(durationBox);
  addBox.appendChild(saveBox);
  addBox.appendChild(cancelBox);
  addBox.setAttribute('id',"addWeekBox");

  document.querySelector('.wrapper').appendChild(addBox);
  this.removeEventListener('click',addWeekInputs);

}

function saveHandler(e){
  // get content from boxes
  let weekToAddTo = document.getElementById('weekAdd');
  let title = document.getElementById('titleBox').value;
  let duration = document.getElementById('duration').value;
  ws.send(
    JSON.stringify ({
      'method'  : 'save',
      'element' : weekToAddTo.innerText,
      'title'   : title,
      'duration': duration
    }));

     document.getElementById('addWeekBox').remove();
     // re-add the event listener to the + button
     document.getElementById(weekToAddTo.innerText).querySelector('.add').addEventListener('click',addWeekInputs);

 }

// after clicking cancel the box is removed
function cancelHandler(e){
   document.getElementById('addWeekBox') .remove();
}


 function yesNoHandler(e){
    selectedEle = this;
    let elementToDelete = selectedEle.parentNode.parentNode;
    if (selectedEle.innerText == "yes"){
    // tell server to delete
    ws.send(
      JSON.stringify ({
        'method' : 'delete',
        'element' : elementToDelete.getAttribute('id')
      }));
   }
   else{
     // delete the yes / no box
     elementToDelete.querySelector(".delete").addEventListener('click',deleteWeek);// readd event listner to delete button
     elementToDelete.removeChild(selectedEle.parentNode); // delete the yes / no box container when done

   }
}


function deleteElement(eleID){
  document.getElementById(eleID).remove();
}

function addWeekToPage(prevEle,title,duration){

  const template = document.querySelector('#week_t');
  const newEl = document.importNode(template.content,true).children[0];

  newEl.querySelectorAll('.delete').forEach((button)=>{
    button.addEventListener('click',deleteWeek);
  });
  newEl.querySelector('details > summary').innerText = title;

  addDragDropHandlers(newEl);

  document.getElementById(prevEle).insertAdjacentElement('afterEnd',newEl);
  // do something with duration

}

function recivedMessageFromServer(e){
  const recived = JSON.parse(e.data);
  if (recived.method == "delete"){
    deleteElement(recived.element);
  }
  else if(recived.method == "save"){
    addWeekToPage(recived.element,recived.title,recived.duration);
  }


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
    for(let i = 0;i<innerDeletes.length;i++){
      innerDeletes[i].addEventListener('click',deleteWeek);
    }
    addDragDropHandlers(dropElem);
  }
  this.classList.remove('over');
  return false;

}

function handleDragEnd(e) {
  this.classList.remove('over');

}




function addDragDropHandlers(elem) {
  elem.addEventListener('dragstart', handleDragStart, false);
  elem.addEventListener('dragover', handleDragOver, false);
  elem.addEventListener('dragleave', handleDragLeave, false);
  elem.addEventListener('drop', handleDrop, false);
  elem.addEventListener('dragend', handleDragEnd, false);
}
