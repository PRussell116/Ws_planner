'use strict';
console.log("connected");
window.addEventListener('load', init);

function init() {
  console.log("init");
  const unitBlock = document.querySelectorAll('unitBlock');

  let weeks = document.querySelectorAll('#weeks .week');
  [].forEach.call(weeks, addDragDropHandlers);

  const deleteButts = document.getElementsByClassName('delete');
  for(let i = 0;i<deleteButts.length;i++){
    deleteButts[i].addEventListener('click',deleteWeek);
  }


}
function deleteWeek(e){
  console.log("delete event start")
  selectedEle = this;



  let confirmBoxContain = document.createElement("section")
  confirmBoxContain.setAttribute("class","decisonContainer")


  let yesBox = document.createElement("p");
  yesBox.innerText = "yes"
  yesBox.setAttribute("class","decisonBox");

  let noBox = document.createElement("p");
  noBox.innerText = "no"
  noBox.setAttribute("class","decisonBox");

  confirmBoxContain.appendChild(yesBox);
  confirmBoxContain.appendChild(noBox);

  //
   yesBox.addEventListener('click',yesNoHandler);
   noBox.addEventListener('click',yesNoHandler);

  this.parentNode.appendChild(confirmBoxContain);


//  if(window.confirm("Are you sure you want to delete " + this.parentNode.firstChild.innerText)){  // change to html, confirm box not cool
  //  selectedEle.parentElement.remove(this);
  //}
  // else dont do anything
}


// this si horrible change this

 function yesNoHandler(e){
   selectedEle = this;
  if (selectedEle.innerText == "yes"){
    selectedEle.parentNode.parentNode.parentNode.removeChild(selectedEle.parentNode.parentNode); // remove the week from the dom
   }
   else{
     console.log("selected ele : " + selectedEle);
     console.log("par1 : " + selectedEle.parentNode);
     console.log("par 2 : " + selectedEle.parentNode.parentNode)
    selectedEle.parentNode.parentNode.removeChild(selectedEle.parentNode); // delete the yes / no box container when done
   }
}


let selectedEle = null;

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
    console.log(dropElem);
    let innerDeletes = dropElem.getElementsByClassName('delete')
    innerDeletes[0].addEventListener('click',deleteWeek);
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
