// Globals.
var myApiKey = "737eba0ebeb16603a948fb8d61cadd22"
var currentBaseURL = "https://api.openweathermap.org/data/2.5/weather?"
var forcastBaseURL = "https://api.openweathermap.org/data/2.5/forecast?"
var geocodingBaseURl = "https://api.openweathermap.org/geo/1.0/direct?"
var currentDay = dayjs()
var forecastDays = [[, 0, 1000, 0], [, 0, 1000, 0], [, 0, 1000, 0], [, 0, 1000, 0], [, 0, 1000, 0]]
var currentLat = 0;
var currentLon = 0;

var cityList = []
var storedCities = localStorage.getItem("cityList");
if (storedCities) {
    cityList = storedCities.split(",");
};

var submitButtonEl = $(".search-button");
var cityListEl = $(".historical-cities");
var historicalCities = $(".historical-cities");
var currentCityEl = $(".city");
var currentTempEl = $(".current-temp");
var currentWindEl = $(".current-wind");
var currentHumEl = $(".current-humidity");
var currentPresEl = $(".current-pressure");
var sunriseEl = $(".sunrise");
var sunsetEl = $(".senset");
var weatherEl = $(".weather");
var forecastEl = $(".forecast");




//function to add cities already in local storage.
function init() {
    if (cityList) {
        for (var i = 0; i < cityList.length; i++) {
            city = cityList[i];
            addCityButton(city);
        }
    }
    for (var i = 0; i <= 4; i++) {
        forecastDays[i][0] = (dayjs().add((i + 1), 'day').format("YYYY-MM-DD"));
    }
};

// Function to add a button for each city searched for.
function addCityButton(city) {
    newCityButton = $('<button type="city" class="btn btn-secondary m-3 city-button"></button>')
    newCityButton.attr("data-city", city);
    newCityButton.text(city);
    $(cityListEl).append(newCityButton);

}

// Function to capitalize the first letter in any text entered.
function capitalize(myText) {
    var capitalized = myText.charAt(0).toUpperCase() + myText.slice(1);
    return capitalized;
};

// Function to send and retrieve the API request.
function getApiData(city) {
    var cards = $(".card");
    if (cards.length) {
        $(".card").remove();
    }

    completeGeoURL = `${geocodingBaseURl}q=${city}&appid=${myApiKey}`
    fetch(completeGeoURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            currentLat = data[0].lat
            currentLon = data[0].lon
        })
        .then(function () {
            fetch(`${currentBaseURL}lat=${currentLat}&lon=${currentLon}&appid=${myApiKey}&units=imperial`)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    $(currentCityEl).text(data.name);
                    $(currentTempEl).text(`Temp: ${data.main.temp}°F`);
                    $(currentWindEl).text(`Wind: ${data.wind.speed}kts @ ${data.wind.deg}°`);
                    $(currentHumEl).text(`Humidity: ${data.main.humidity}%`);
                    $(currentPresEl).text(`Pressure: ${data.main.pressure}mB`)
                    $(weatherEl).text(`Conditions: ${data.weather[0].description}`);
                })
        })
        .then(function () {
            fetch(`${forcastBaseURL}lat=${currentLat}&lon=${currentLon}&appid=${myApiKey}&units=imperial`)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    // loop over the forecast days array.
                    for (var i = 0; i < forecastDays.length; i++) {
                        workingDay = forecastDays[i][0];
                        // loop through the data, comparing temps.
                        for (var j = 0; j < data.list.length; j++) {
                            searchDay = dayjs.unix(data.list[j].dt).format("YYYY-MM-DD");
                            if (searchDay == workingDay) {
                                if (data.list[j].main.temp_max >= forecastDays[i][1]) {
                                    forecastDays[i][1] = data.list[j].main.temp_max;
                                }
                                if (data.list[j].main.temp_min <= forecastDays[i][2]) {
                                    forecastDays[i][2] = data.list[j].main.temp_min;
                                }
                                if (data.list[j].main.humidity >= forecastDays[i][3]) {
                                    forecastDays[i][3] = data.list[j].main.humidity;
                                }
                            } else { continue; }
                        }
                    }
                    for (var k = 0; k < forecastDays.length; k++) {
                        var newCard = $('<div class="card text-center w-30 bg-dark text-white">');
                        var newTitle = $('<h5 class="card-title"></h5>');
                        var cardTextHigh = $('<p class="card-text low-temp"></p>');
                        var cardTextLow = $('<p class="card-text high-temp"></p>');
                        var cardTextHum = $('<p class="card-text humidity"></p>');
                        $(newCard).append(newTitle);
                        $(newCard).append(cardTextHigh);
                        $(newCard).append(cardTextLow);
                        $(newCard).append(cardTextHum);
                        $(newTitle).text(forecastDays[k][0]);
                        $(cardTextHigh).text(`High: ${forecastDays[k][1]} °F`);
                        $(cardTextLow).text(`Low: ${forecastDays[k][2]} °F`);
                        $(cardTextHum).text(`Humidity: ${forecastDays[k][3]}%`);
                        $(forecastEl).append(newCard);
                    }
                })
        })
}



// Event handler(s)
submitButtonEl.on('click', function (event) {
    event.preventDefault();
    var searchedCity = $("#city").val().trim();
    if (searchedCity == "") {
        return;
    }
    var capCity = capitalize(searchedCity);
    if (!cityList.includes(capCity)) {
        cityList.push(capCity);
        localStorage.setItem("cityList", cityList);
        addCityButton(capCity);
    };
    getApiData(capCity);
});

historicalCities.on('click', '.city-button', function (event) {
    getApiData($(event.target).attr('data-city'));
});

init();