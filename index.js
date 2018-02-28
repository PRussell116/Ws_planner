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
  selectedEle = this;
  if(window.confirm("Are you sure you want to delete " + this.parentNode.firstChild.innerText)){
    selectedEle.parentElement.remove(this);
  }
  // else dont do anything
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
