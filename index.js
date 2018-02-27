'use strict';
console.log("connected");
window.addEventListener('load',init);

function init(){
  console.log("init");
   const unitBlock = document.querySelectorAll('unitBlock');

let weeks = document.querySelectorAll('#weeks .week');
[].forEach.call(weeks, addDragDropHandlers);
  // const weeks = document.querySelectorAll('week');
//   for(let i = 0;i<weeks.length;i++){
  //   addDnDHandlers(weeks[i]);
//   }
   // let weekSummaries = document.querySelectorAll('summary');
   // for(let i = 0;i<weekSummaries.length;i++){
   //   weekSummaries[i].addEventListener



     //if(weekSummaries[i].contains == true){
       //weekSummaries[i].content= "ABC";
  //   }
   //}


}
let selectedEle = null;

function handleDragStart(e){
  selectedEle = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html',this.outerHTML);
  this.classList.add('dragElem')
  console.log("drag start");


}
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  this.classList.add('over');

  e.dataTransfer.dropEffect = 'move';
  return false;
  console.log("drag over");
}
function handleDragLeave(e){
  this.classList.remove('over');
  console.log("drag leave");
}

function handleDrop(e){
  if(e.stopPropagation){
    e.stopPropagation();
  }
  if(selectedEle != this){
    this.parentNode.removeChild(selectedEle)
    let dropHTML = e.dataTransfer.getData('text/html');
    this.insertAdjacentHTML('beforeBegin',dropHTML);
    let dropElem = this.previousSibling;
    addDragDropHandlers(dropElem);
  }
  this.classList.remove('over');
  return false;
  console.log("drop");
}

function handleDragEnd(e){
  this.classList.remove('over');
  console.log("drag end");
}

function addDragDropHandlers(elem){
 elem.addEventListener('dragstart', handleDragStart, false);
 //elem.addEventListener('dragenter', handleDragEnter, false)
 elem.addEventListener('dragover', handleDragOver, false);
 elem.addEventListener('dragleave', handleDragLeave, false);
 elem.addEventListener('drop', handleDrop, false);
 elem.addEventListener('dragend', handleDragEnd, false);
 console.log("listeners added")
}
