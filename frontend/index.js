
let colors = ["green", "purple", "red", "pink", "yellow", "blue", "orange", "aqua", "black"]

let dates = []
let roomNo = -1

let roomState = {}


const socket = new WebSocket("ws://localhost:8001/ws");

socket.onopen = function(event){
    let playerData = JSON.parse(localStorage.getItem('active-client-metadata'));
    
    if (playerData) {
      socket.send(JSON.stringify({"type":"active-client-metadata", "payload": playerData}));
    } 
}

function hideMainScreen() {
    Array.from(document.getElementsByClassName("content")).forEach((ele) => ele.style.display = "none")
    Array.from(document.getElementsByClassName("calendar")).forEach((ele) => ele.style.display = "none")
}

function showMainScreen() {
    Array.from(document.getElementsByClassName("content")).forEach((ele) => ele.style.display = "block")
    Array.from(document.getElementsByClassName("calendar")).forEach((ele) => ele.style.display = "grid")

}

function disconnect() {
    let playerData = JSON.parse(localStorage.getItem('active-client-metadata'));
      
    if (playerData) {
      socket.send(JSON.stringify({"type":"disconnect", "payload":playerData}))
    } 
  }

window.addEventListener("beforeunload", (ev) => {  
    disconnect()
});

function handleReset(){
    disconnect()
    // setRoomState(null)
    localStorage.clear()
}

function setCreatedRoomNumber(roomNumber){
    roomNo = roomNumber
    document.getElementById("entry-room-number").innerText = roomNumber
    showElementById("entry-room-number")
    showElementById("room-number-description")
    hideElementById("room-input")
    hideElementById("name-input")
    hideElementById("create-room-button")
}

function showCreatedRoomNumber(){
    showElementById("entry-room-number")
}

function showElementById(id){
    document.getElementById(id).style.display = "inline"
}

function hideElementById(id){
    document.getElementById(id).style.display = "none"
}

function updateRoomState(roomS) {
    setUpColor(getUser(roomS)["color-pos"])
    if(Object.keys(roomState).length === 0){
        hideElementById("entry-page")
        showMainScreen()
    }
    roomState = roomS
    renderDateTimes()
    displayRoomNumber()
    renderUsers()
}

function renderUsers() {
    document.getElementById("users").innerHTML = ''
    const userSpan = document.createElement("span")
    userSpan.classList.add("user-span")
    userSpan.innerText = "Users:"
    document.getElementById("users").appendChild(userSpan)
    roomState["active-clients"].forEach((client)=> {
        const span = document.createElement("span")
        span.innerText = client.name
        span.classList.add("user")
        span.style.borderColor = colors[client["color-pos"]]
        // span.style.backgroundColor = colors[client["color-pos"]]
        document.getElementById("users").appendChild(span)
    })
}

function displayRoomNumber() {
    document.getElementById("room-number").style.display = "inline"
    console.log(roomState)
    document.getElementById("room-number").innerText = "Room: " + roomState["room-id"]
}

function getClientId(){
    return JSON.parse(localStorage.getItem("active-client-metadata"))["uuid"].toString()
}

socket.onmessage = function(event) {
    let data = JSON.parse(event.data)
    console.log(data)
    if(data["type"] === "send-room-number") {
        setCreatedRoomNumber(data["payload"]["room-number"])
    }
    if(data["type"] === "error") {
        showRoomError()
    }
    if(data["type"] === "room-state") {
        updateRoomState(data["payload"])
    }
    if(data["type"] === "active-client-metadata") {
        localStorage.setItem("active-client-metadata", JSON.stringify(data["payload"]))
      }
  };

  function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  function userEnteredRoomNumber(){
    return document.getElementById("room-input").value
  }

  function userEnteredName(){
    return document.getElementById("name-input").value
  }

  function joinRoom() {
    if(roomNo === -1 && !validateFields(true)) return
    // setJoiningRoom(true)
    let playerData = JSON.parse(localStorage.getItem('active-client-metadata'));
    console.log(playerData ? playerData["uuid"] : uuidv4());
    socket.send(JSON.stringify({
        "type":"join-room", 
        "payload": {
            "room-id": Number(roomNo !== -1 ? roomNo : userEnteredRoomNumber()),
            "name":userEnteredName(),
            "uuid": playerData ? playerData["uuid"] : uuidv4().toString()
        }
    }))
}

function checkIfWord(str){
    return /^[a-zA-Z]+$/.test(str);
}

function checkIfNumber(str){
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

function validateFields(checkRoom){
    if(checkRoom && !checkIfNumber(userEnteredRoomNumber()) && !checkIfWord(userEnteredName())) {
        showElementById("room-error")
        showElementById("name-error")
        return false
    }
    if(checkRoom && !checkIfNumber(userEnteredRoomNumber())) {
        showElementById("room-error")
        return false
    }
    if(!checkIfWord(userEnteredName())) {
        showElementById("name-error")
        return false
    }
    hideElementById("room-error")
    hideElementById("name-error")
    return true

}

function createRoom() {
    if(!validateFields(false)) return
    // setCreatingRoom(true)
    socket.send(JSON.stringify({
        "type":"create-room",
        "payload": {}
    }))
}

window.onload = () => {
    document.getElementById('create-room-button').onclick = createRoom
    document.getElementById('join-room-button').onclick = joinRoom
    document.getElementById("submit-button").onclick = handleSubmitClick
    document.getElementById("clear-button").onclick = handleClearClick
    dateButtons = Array.from(document.getElementsByClassName("date-button"))
    dateButtons.forEach((date) => {date.onclick = (event) => handleDateClick(event, dateButtons)})
    setDates()
    setInitialButtonStates(dates, dateButtons)
    setUpColor(1)
}

function setUpColor(pos){
    document.documentElement.style.setProperty('--primary-color', colors[pos]);
}

function calculatePercantageOfDay(date) {
    const startDateTime = new Date(date["start-date-time"])
    const endDateTime = new Date(date["end-date-time"])

    let startHour = startDateTime.getHours()
    let endHour = endDateTime.getHours()
    let startMinute = startDateTime.getMinutes()
    let endMinute = endDateTime.getMinutes()

    let startPercantage = (startHour*60+startMinute) / 1440.0
    let endPercantage = (endHour*60+endMinute) / 1440.0
    return [startPercantage, endPercantage]
}

let times = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", ""]

function getTimeline() {
    const timeline = document.createElement('div')
    timeline.classList.add('timeline')

    const hashes = document.createElement('div')
    hashes.classList.add('hashes')

    const line = document.createElement('div')
    line.classList.add('line')

    for(let i = 0; i < 48; i++) {
        const hashDiv = document.createElement('div')
        hashDiv.classList.add('hash-div')
        const hash = document.createElement('div')
        hash.classList.add('hash')
        hashDiv.appendChild(hash)
        if(i%2 === 0) {
            const span = document.createElement('span')
            const text = document.createTextNode(times[i/2])
            span.appendChild(text)
            span.classList.add('timeline-number')
            hashDiv.appendChild(span)
        }
        hashes.appendChild(hashDiv)
    }

    
    timeline.appendChild(hashes)
    timeline.appendChild(line)
    return timeline

}

function checkDayOfWeek(date, d) {
    const day = new Date(date["start-date-time"]).toString().substring(0, 3)
    return day === d
}

function getUser(roomS){
    return roomS["active-clients"].filter((client) => client.uuid === getClientId())[0]
}

function renderDateTimes(){
    let timeListing = document.getElementById("time-listing")
    timeListing.innerHTML = ''

    getUser(roomState)["times"].forEach((date) => {
        renderDateTimeOnToolbar(date, timeListing)
    })

    
    clearCalendar()
    roomState["active-clients"].forEach((client) =>{
        renderDateTimesOnCalendar(client)
    })
    renderTimelines()
}

function renderDayDiv(dayDiv, dates, colorPos){
    dates.forEach((date) => {
        dayDiv.appendChild(getAvailabilityDiv(date, dayDiv.getBoundingClientRect(), colorPos))
    })
}

function getAvailabilityDiv(date, rect, colorPos){

    console.log(date, rect, colorPos)

    const availibilityDiv = document.createElement('div')
    availibilityDiv.classList.add('availability-div')

    const [startPercantage, endPercantage] = calculatePercantageOfDay(date)
    const width = (rect.width * endPercantage) - (rect.width * startPercantage)
    const startingPosition = rect.width*startPercantage
    const availibility = document.createElement('div')
    availibility.style.width = width.toString() + 'px'
    availibility.style.position="absolute"
    availibility.style.height = "23px"
    availibility.style.padding = "1px"
    availibility.style.backgroundColor = colors[colorPos]
    availibility.style.left = startingPosition + "px"

    availibilityDiv.appendChild(availibility)
    return availibilityDiv
}

function clearCalendar() {
    document.getElementById("sunday-calendar-div").innerHTML = ''
    document.getElementById("monday-calendar-div").innerHTML = ''
    document.getElementById("tuesday-calendar-div").innerHTML = ''
    document.getElementById("wednesday-calendar-div").innerHTML = ''
    document.getElementById("thursday-calendar-div").innerHTML = ''
    document.getElementById("friday-calendar-div").innerHTML = ''
    document.getElementById("saturday-calendar-div").innerHTML = ''
}

function renderDateTimesOnCalendar(client) { 
    console.log(client["times"].filter((date) => checkDayOfWeek(date, 'Wed')))
    renderDayDiv(document.getElementById("sunday-calendar-div"), client["times"].filter((date) => checkDayOfWeek(date, 'Sun')), client["color-pos"])
    renderDayDiv(document.getElementById("monday-calendar-div"), client["times"].filter((date) => checkDayOfWeek(date, 'Mon')), client["color-pos"])
    renderDayDiv(document.getElementById("tuesday-calendar-div"), client["times"].filter((date) => checkDayOfWeek(date, 'Tue')), client["color-pos"])
    renderDayDiv(document.getElementById("wednesday-calendar-div"), client["times"].filter((date) => checkDayOfWeek(date, 'Wed')), client["color-pos"])
    renderDayDiv(document.getElementById("thursday-calendar-div"), client["times"].filter((date) => checkDayOfWeek(date, 'Thu')), client["color-pos"])
    renderDayDiv(document.getElementById("friday-calendar-div"), client["times"].filter((date) => checkDayOfWeek(date, 'Fri')), client["color-pos"])
    renderDayDiv(document.getElementById("saturday-calendar-div"), client["times"].filter((date) => checkDayOfWeek(date, 'Sat')), client["color-pos"])
}

function renderTimelines(){
    document.getElementById("sunday-calendar-div").appendChild(getTimeline())
    document.getElementById("monday-calendar-div").appendChild(getTimeline())
    document.getElementById("tuesday-calendar-div").appendChild(getTimeline())
    document.getElementById("wednesday-calendar-div").appendChild(getTimeline())
    document.getElementById("thursday-calendar-div").appendChild(getTimeline())
    document.getElementById("friday-calendar-div").appendChild(getTimeline())
    document.getElementById("saturday-calendar-div").appendChild(getTimeline())
}

function renderDateTimeOnToolbar(date, timeListing) { 
    const startDateTime = new Date(date["start-date-time"])
    const endDateTime = new Date(date["end-date-time"])
    
    const startDate = startDateTime.toString().substring(4,10)
    const endDate = endDateTime.toString().substring(4, 10)

    const startTimeString = startDateTime.toLocaleTimeString()
    const endTimeString = endDateTime.toLocaleTimeString()
    const startTime = startTimeString.substring(0, startTimeString.length-6)  + ' ' + startTimeString.substring(startTimeString.length-2, startTimeString.length)
    const endTime = endTimeString.substring(0,endTimeString.length-6) + ' ' + endTimeString.substring(endTimeString.length-2, endTimeString.length)

    const span = document.createElement("span")
    const text = document.createTextNode( !isNaN(startDateTime) && !isNaN(endDateTime) ? (startDate + ", " + startTime + " - " + endDate + ", " + endTime) : "Invalid Date(s)")
    span.appendChild(text)
    span.classList.add("time")

    span.onclick = () => {
        timeListing.removeChild(span)
        roomState["active-clients"][roomState["active-clients"].indexOf(getUser(roomState))]["times"].splice(
            roomState["active-clients"][roomState["active-clients"].indexOf(getUser(roomState))]["times"].indexOf(date), 1)
        sendRoomState()
    }
    timeListing.appendChild(span)
}

function setDates() {
    let previousSunday = getPreviousSunday()
    let date = new Date(previousSunday)
    dates.push(previousSunday)
    date.setDate(date.getDate() + 1)
    dates.push(new Date(date))
    date.setDate(date.getDate() + 1)
    dates.push(new Date(date))
    date.setDate(date.getDate() + 1)
    dates.push(new Date(date))
    date.setDate(date.getDate() + 1)
    dates.push(new Date(date))
    date.setDate(date.getDate() + 1)
    dates.push(new Date(date))
    date.setDate(date.getDate() + 1)
    dates.push(new Date(date))
    document.getElementById("sunday-date").innerText = dates[0].getDate()
    document.getElementById("monday-date").innerText = dates[1].getDate()
    document.getElementById("tuesday-date").innerText = dates[2].getDate()
    document.getElementById("wednesday-date").innerText = dates[3].getDate()
    document.getElementById("thursday-date").innerText = dates[4].getDate()
    document.getElementById("friday-date").innerText = dates[5].getDate()
    document.getElementById("saturday-date").innerText = dates[6].getDate()
}

function setInitialButtonStates(dates, dateButtons) {
    dates.forEach((date) => {
        if (date.getDate() < new Date(Date.now()).getDate()) {
            disableButton(dateButtons[dates.indexOf(date)])
        } else if(date.getDate() === new Date(Date.now()).getDate()) {
            selectButton(dateButtons[dates.indexOf(date)])
        } else {
            defaultButton(dateButtons[dates.indexOf(date)])
        }
    })
}

function disableButton(button){
    button.classList.remove("default")
    button.classList.remove("selected")
    button.classList.add("disabled")
}

function selectButton(button){
    button.classList.remove("default")
    button.classList.remove("disabled")
    button.classList.add("selected")
}

function defaultButton(button){
    button.classList.remove("disabled")
    button.classList.remove("selected")
    button.classList.add("default")
}

function getPreviousSunday() {
    const dateObject = new Date();
    while(!dateObject.toString().startsWith("Sun")) {
        dateObject.setDate(dateObject.getDate()-1)
    }
    return dateObject
}

function getClickedDate() {
    let dateButtons = Array.from(document.getElementsByClassName("date-button"))
    let selectedDate = "hi"
    dateButtons.forEach((date) => {
        if(date.classList.contains("selected")) {
            selectedDate = date
        }
    })
    return selectedDate
}

function handleSubmitClick(e) {
    let dateNumber = getClickedDate().firstChild.nextSibling.innerText
    let dateAsISO = dates.filter(date => date.toISOString().substring(8, 10) === dateNumber)[0].toISOString()
    let startTime = document.getElementById("enter-start-time")
    let endTime = document.getElementById("enter-end-time")
    let startDateTime = dateAsISO.substring(0, 11) + startTime.value + ":00.000-05:00"
    let endDateTime = dateAsISO.substring(0, 11) + endTime.value + ":59.999-05:00"
    roomState["active-clients"][roomState["active-clients"].indexOf(getUser(roomState))]["times"].push({
        "start-date-time": startDateTime, 
        "end-date-time": endDateTime
    })
    sendRoomState()
}

function sendRoomState() {
    socket.send(JSON.stringify({
        "type": "room-state", 
        "payload":  {
            "room-id": roomState["room-id"],
            "room-size": roomState["room-size"],
            "active-clients": roomState["active-clients"]
  }}))
}

function handleClearClick(e) {
    roomState["active-clients"][roomState["active-clients"].indexOf(getUser(roomState))]["times"] = []
    sendRoomState()
}

function handleDateClick(e, dateButtons) {
    target = e.target
    if(target.nodeName.toLowerCase() === "span") {
        target = target.parentNode
    }
    if(!target.classList.contains("disabled")) {
        dateButtons.forEach(button => {
            if(button !== target && !button.classList.contains("disabled")) {
                defaultButton(button)
            }
        });
        selectButton(target)
    }
}