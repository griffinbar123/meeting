
let userDateTimes = [{startDateTime: '2023-09-19T01:40:00.000-05:00', endDateTime: '2023-09-19T13:40:59.999-05:00'}]
let colors = ["green", "purple", "red", "pink", "yellow", "orange", "aqua", "black"]
let dates = []

window.onload = () => {
    document.getElementById("submit-button").onclick = handleSubmitClick
    document.getElementById("clear-button").onclick = handleClearClick
    dateButtons = Array.from(document.getElementsByClassName("date-button"))
    dateButtons.forEach((date) => {date.onclick = (event) => handleDateClick(event, dateButtons)})
    setDates()
    setInitialButtonStates(dates, dateButtons)
    renderDateTimes()
}

function calculatePercantageOfDay(date) {
    const startDateTime = new Date(date.startDateTime)
    const endDateTime = new Date(date.endDateTime)

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
    const day = new Date(date.startDateTime).toString().substring(0, 3)
    return day === d
}

function renderDateTimes(){
    let timeListing = document.getElementById("time-listing")
    timeListing.innerHTML = ''
    userDateTimes.forEach((date) => {
        renderDateTimeOnToolbar(date, timeListing)
    })
    renderDateTimesOnCalendar()
}

function renderDayDiv(dayDiv, dates){
    dayDiv.innerHTML = ''

    dates.forEach((date) => {
        dayDiv.appendChild(getAvailabilityDiv(date, dayDiv.getBoundingClientRect()))
    })
    dayDiv.appendChild(getTimeline())
}

function getAvailabilityDiv(date, rect){

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
    availibility.style.backgroundColor ="blue"
    availibility.style.left = startingPosition + "px"

    availibilityDiv.appendChild(availibility)
    return availibilityDiv
}

function renderDateTimesOnCalendar() { 
    renderDayDiv(document.getElementById("sunday-calendar-div"), userDateTimes.filter((date) => checkDayOfWeek(date, 'Sun')))
    renderDayDiv(document.getElementById("monday-calendar-div"), userDateTimes.filter((date) => checkDayOfWeek(date, 'Mon')))
    renderDayDiv(document.getElementById("tuesday-calendar-div"), userDateTimes.filter((date) => checkDayOfWeek(date, 'Tue')))
    renderDayDiv(document.getElementById("wednesday-calendar-div"), userDateTimes.filter((date) => checkDayOfWeek(date, 'Wed')))
    renderDayDiv(document.getElementById("thursday-calendar-div"), userDateTimes.filter((date) => checkDayOfWeek(date, 'Thu')))
    renderDayDiv(document.getElementById("friday-calendar-div"), userDateTimes.filter((date) => checkDayOfWeek(date, 'Fri')))
    renderDayDiv(document.getElementById("saturday-calendar-div"), userDateTimes.filter((date) => checkDayOfWeek(date, 'Sat')))
}

function renderDateTimeOnToolbar(date, timeListing) { 
    const startDateTime = new Date(date.startDateTime)
    const endDateTime = new Date(date.endDateTime)
    
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
        userDateTimes.splice(userDateTimes.indexOf(date), 1)
        renderDateTimesOnCalendar()
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
    userDateTimes.push({
        "startDateTime": startDateTime, 
        "endDateTime": endDateTime
    })
    renderDateTimes()
}

function handleClearClick(e) {
    userDateTimes = []
    renderDateTimes()
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