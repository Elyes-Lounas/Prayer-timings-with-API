//set variables
let fastingHours = document.querySelectorAll(".fasting-hours");
let cityDate = document.querySelector(".date");
let dayName = document.querySelector(".day-name");
let miladi = document.querySelector(".date");
let hijri = document.querySelector(".hijri");
let timeBegin = document.querySelector(".time-begin");
let timeEnd = document.querySelector(".time-end");

//setting the current date and time
let date = new Date();
let d = date.getDate();
d = d < 10 ? "0" + d : d;
let m = date.getMonth();
m++;
m = m < 10 ? "0" + m : m;
let y = date.getFullYear();
let currentDate = `${d}-${m}-${y}`;
let table = document.querySelector(".table");
let searchBtn = document.querySelector('[type="submit"]');
let timeNow = document.querySelector(".time-now");
let h, me, s;
setInterval(setTime, 1000);
//function to display the current time
function setTime() {
  let time = new Date();
  h = time.getHours();
  me = time.getMinutes();
  s = time.getSeconds();
  h = h < 10 ? "0" + h : h;
  me = me < 10 ? "0" + me : me;
  s = s < 10 ? "0" + s : s;
  if (h >= 12) timeNow.textContent = `${h}:${me}:${s} PM`;
  else timeNow.textContent = `${h}:${me}:${s} AM`;
  return `${h}:${me}:${s}`;
}
searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let value = document.querySelector(".form-control").value;
  try {
    errorHandling(value);
  } catch (e) {
    alert(e);
  }
});

//handle empty input
function errorHandling(value) {
  if (!value) throw "please enter a city";
  // updating timings according to the input value
  else getData(value);
}

//getting the data from the server
async function getData(city) {
  let _URL = `http://api.aladhan.com/v1/calendarByCity/2024/2?city=${city}&country=algeria&method=2`;
  let res = await fetch(_URL);
  let data = await res.json();
  data = data.data;
  console.log(data);
  showTimings(data);
}
//initialize the input value by the city of alger
getData("alger");

//showing the timings
function showTimings(data) {
  table.innerHTML = "";
  data.forEach((item) => {
    let targetDate = item.date.gregorian.date;
    if (targetDate == currentDate) {
      table.innerHTML += `
        <thead>
              <tr>
                <th scope="col">Prayer</th>
                <th scope="col">Azan time</th>
              </tr>
            </thead>
            <tbody class="timings">
              <tr>
                <td >Fajr</td>
                <td>${item.timings.Fajr.slice(0, 5)} AM</td>
              </tr>
              <tr>
                <td>Sunrise</td>
                <td>${item.timings.Sunrise.slice(0, 5)} AM</td>
              </tr>
              <tr>
                <td>Dhuhr</td>
                <td>${item.timings.Dhuhr.slice(0, 5)} AM</td>
              </tr>
              <tr>
                <td>Asr</td>
                <td>${item.timings.Asr.slice(0, 5)} AM</td>
              </tr>
              <tr>
                <td>Maghrib</td>
                <td>${item.timings.Maghrib.slice(0, 5)} AM</td>
              </tr>
              <tr>
                <td>Isha</td>
                <td>${item.timings.Isha.slice(0, 5)} AM</td>
              </tr>
            </tbody>
        `;
      updateInfo(item);
    }
  });
  let nextPrayer = document.querySelector(".active");
  let timings = document.querySelectorAll(".timings tr");
  selectingNextPrayer(timings);
}

//selecting the next prayer
function selectingNextPrayer(timings) {
  for (let i = 0; i < timings.length; i++) {
    let currTiming = timings[i];
    let nextTiming = timings[i + 1];
    setInterval(() => {
      let v = setTime().slice(0, 5).replace(":", "");
      let t = setTime();
      //special case for Fajr prayer
      if (i == timings.length - 1) {
        if (
          v >=
          currTiming.lastElementChild.textContent.slice(0, 5).replace(":", "")
        || v < timings[0].lastElementChild.textContent.slice(0, 5).replace(":", "")) {
          pussy(timings, timings[0]);
          calculatingRemainingTime(timings[0], t);
        }
        return;
      }

      if (
        v >=
          currTiming.lastElementChild.textContent
            .slice(0, 5)
            .replace(":", "") &&
        v < nextTiming.lastElementChild.textContent.slice(0, 5).replace(":", "")
      ) {
        pussy(timings, nextTiming);
        calculatingRemainingTime(nextTiming, t);
      }
    }, 1000);
  }
}

function pussy(timings, nextTiming) {
  timings.forEach((timing) => {
    nextTiming.classList.remove("active");
  });
  nextTiming.classList.add("active");
  document.querySelectorAll(".next-prayer").forEach((item) => {
    item.textContent = nextTiming.firstElementChild.textContent;
  });
  document.querySelector(".next-prayer-time").textContent =
    nextTiming.lastElementChild.textContent;
}

function calculatingRemainingTime(nextTiming, t) {
  let hoursNext = nextTiming.lastElementChild.textContent.slice(0, 2);
  let minutesNext = nextTiming.lastElementChild.textContent.slice(3, 5);
  let secondsNext = 0;
  let hoursCurr = t.slice(0, 2);
  let minutesCurrt = t.slice(3, 5);
  let secondsCurr = t.slice(6, 8);
  hoursCurr = toNumber(hoursCurr) * 3600;
  hoursNext = toNumber(hoursNext) * 3600;
  minutesNext = toNumber(minutesNext) * 60;
  minutesCurrt = toNumber(minutesCurrt) * 60;
  secondsCurr = toNumber(secondsCurr);
  let remainSeconds =
    hoursNext +
    minutesNext +
    secondsNext -
    (hoursCurr + minutesCurrt + secondsCurr);
  //special case for Fajr prayer
  if (remainSeconds < 0){
    remainSeconds = hoursNext + minutesNext - (86400 - hoursCurr + minutesCurrt + secondsCurr)
  } 
  let timeRemain = convertSecondsToHMS(remainSeconds);
  //display remaing time
  document.querySelector(
    ".time-remain"
  ).textContent = `${timeRemain[0]}:${timeRemain[1]}:${timeRemain[2]}`;
}
function toNumber(str) {
  return Number(str);
}
function convertSecondsToHMS(seconds) {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  var remainingSeconds = seconds % 60;
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  remainingSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;
  return [hours, minutes, remainingSeconds];
}

function updateInfo(item) {
  let fasHours =
    Number(item.timings.Maghrib.slice(0, 2)) -
    Number(item.timings.Fajr.slice(0, 2));

  let fasMinutes =
    Number(item.timings.Maghrib.slice(3, 5)) -
    Number(item.timings.Fajr.slice(3, 5));
  fastingHours.forEach((item) => {
    item.textContent = `${fasHours} hours and ${fasMinutes} minutes`;
  });
  dayName.textContent = item.date.gregorian.weekday.en;
  hijri.textContent =
    item.date.hijri.day +
    " " +
    item.date.hijri.month.en +
    " " +
    item.date.hijri.year;
  miladi.textContent =
    item.date.gregorian.day +
    " " +
    item.date.gregorian.month.en +
    " " +
    item.date.gregorian.year;
  timeBegin.textContent = item.timings.Fajr.slice(0, 5) + " AM";
  timeEnd.textContent = item.timings.Isha.slice(0, 5) + " PM";
}
let cities = document.querySelector(".cities");
let select = document.querySelector(".select");

// filling the HTML page by algerian cities
async function showCities() {
  let res = await fetch("dz.json");
  let data = await res.json();
  data.map((item) => {
    select.innerHTML += `<option>${item.city}</option>`;
  });
  data.map((item) => {
    cities.innerHTML += `
    <div class=" col-md-3 col-6">
       <i class="fa-solid fa-location-dot"></i>
       <a class="target-city" href="#">${item.city}</a>
    </div>`;
  });
  let targetCities = document.querySelectorAll(".target-city");
  updateTimings(targetCities);
}
showCities();

let prayerCity = document.querySelectorAll(".location");
//updating timings by selecting the city
function updateTimings(targetCities) {
  targetCities.forEach((item) => {
    item.addEventListener("click", () => {
      getData(item.textContent);
      prayerCity.forEach((location) => {
        location.textContent = `${item.textContent}`;
      });
    });
  });
  select.addEventListener("change", () => {
    getData(select.value);
  });
}
