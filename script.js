const joke = document.getElementById("the_joke");
const form = document.getElementById("commentSubmit");
const commentLists = document.getElementById("comment_lists");
const img = document.getElementById("img");
const dialog = document.querySelector("dialog");
const openBtn = document.getElementById("open_btn");
const closeBtn = document.getElementById("close_btn");
const imgSrc = [
  "./assets/haha.gif",
  "./assets/haha1.gif",
  "./assets/haha3.gif",
  "./assets/haha4.gif",
  "./assets/haha5.gif",
  "./assets/lol.gif",
  "./assets/lol1.gif",
];
// init the target time
let targetTime;

openBtn.addEventListener("click", () => {
  dialog.showModal();
});

closeBtn.addEventListener("click", () => {
  dialog.close();
});

//built request URL
function builtURL() {
  return "https://v2.jokeapi.dev/joke/Any?type=single";
}

//display response data that joke to the HTML element
function displayJokeToDOM(responseJoke) {
  joke.innerHTML = responseJoke;
}

//display img(gif) in random order
function displayImg() {
  const randomIndex = Math.floor(Math.random() * imgSrc.length);
  img.src = imgSrc[randomIndex];
}

//display user comments that from localStorage and them loop them and assign them in li element
function displayComment() {
  const storageValue = localStorage.getItem("jokeComments");
  commentLists.innerHTML = null;
  const comments = storageValue ? JSON.parse(storageValue) : [];
  for (let i = 0; i < comments.length; i++) {
    const li = document.createElement("li");
    li.id = i;
    li.classList.add("comment");
    li.innerText = `(${i + 1}) ${comments[i]}`;
    commentLists.append(li);
  }
}

//fetching api endpoint and return joke data
async function fetchingAPIEndPoint(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.joke;
  } catch (err) {
    console.error(err);
  } finally {
    console.log("finished api call");
  }
}

//process the api call in async
async function processAPIcall() {
  const requestURL = builtURL();
  const responseJokeData = await fetchingAPIEndPoint(requestURL);
  storedJokeToLS(responseJokeData);
}

//store the comments that user enter to localStorage
function storedCommentToLS() {
  const inputComment = document.getElementById("input");
  const storedComments = localStorage.getItem("jokeComments");
  const comments = storedComments ? JSON.parse(storedComments) : [];
  comments.push(inputComment.value);
  localStorage.setItem("jokeComments", JSON.stringify(comments));
  inputComment.value = null;
}

//store the api return joke data to localStorage
function storedJokeToLS(j) {
  if (j) {
    const storedJoke = localStorage.getItem("joke");
    const joke = storedJoke ? JSON.parse(storedJoke) : j;
    localStorage.setItem("joke", JSON.stringify(joke));
    displayJokeToDOM(joke);
  } else {
    console.error("Invalid joke response");
  }
}

//function to clear all the data in localStorage
function clearLS() {
  localStorage.clear();
}

//check the target time is reach by comparing current time and target time
function isTargetTimeReach() {
  const currentTime = new Date().getTime();
  return currentTime >= targetTime;
}

// function that call clearLS(), startCountdown() and set target time to next 2 hours and
function setNextTimer() {
  clearLS();
  targetTime = new Date().getTime() + 2 * 60 * 60 * 1000;
  localStorage.setItem("targetTime", targetTime.toString());
  startCountdown();
}

//function that call interval in every 1000ms count down the time and remain time is equal or less than 0
//then clear the interval, call the setNextTimer(), processAPIcall() and reload the window
//set the  count down timer to DOM element and updating the time in every 1000ms
function startCountdown() {
  const time = setInterval(countdown, 1000);
  function countdown() {
    const currentTime = new Date().getTime();
    const remainTime = targetTime - currentTime;

    if (remainTime <= 0) {
      clearInterval(time);
      setNextTimer();
      processAPIcall();
      location.reload();
      return;
    }
    const remainingHours = Math.floor(remainTime / (60 * 60 * 1000));
    const remainingMinutes = Math.floor(
      (remainTime % (60 * 60 * 1000)) / (60 * 1000)
    );
    const remainingSeconds = Math.floor((remainTime % (60 * 1000)) / 1000);
    document.getElementById(
      "remainTime"
    ).innerText = `Next Joke is coming in: ${Math.abs(
      remainingHours
    )} hour, ${Math.abs(remainingMinutes)} minute, ${Math.abs(
      remainingSeconds
    )} second`;
  }
}

//display the comment, display the img, and
//check the time from localStorage
//add form event to the form for user input the comments
document.addEventListener("DOMContentLoaded", () => {
  displayComment();
  displayImg();
  const storedTargetTime = localStorage.getItem("targetTime");
  if (storedTargetTime) {
    targetTime = parseInt(storedTargetTime);

    if (isTargetTimeReach()) {
      processAPIcall();
      setNextTimer();
    } else {
      processAPIcall();
      startCountdown();
    }
  } else {
    processAPIcall();
    setNextTimer();
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    storedCommentToLS();
    displayComment();
  });
});
