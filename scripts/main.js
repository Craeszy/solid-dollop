let myImage = document.querySelector('img');

myImage.onclick = function() {
    let mySrc = myImage.getAttribute('src');
    if(mySrc == 'images/superman.png') {
        myImage.setAttribute('src', 'images/batman.png');
    } else {
        myImage.setAttribute('src', 'image/superman.png');
    }
}

let myButton = document.querySelector('button');
let myHeading = document.querySelector('h1');

function setUserName() {
    let myName = promt('请输入你的名字：');
    if(!myName || myName === null) {
        setUserName();
    } else {
      localStorage.setItem('name', myName);
      myHeading.textContent = 'Superhero is' + myName;
    }
}

if(!localStorage.getItem('name')) {
    setUsername();
} else {
    let storedName = localStorage.getItem('name');
    myHeading.textContent = 'Superhere is' + storedName;
}

myButton.onClick = function() {
    setUserName();
}
