'use strict';

var EVENTFUL_SEARCH_URL = 'https://api.eventful.com/json/events/search';
function getDataFromApi(searchTermOne, searchTermTwo, searchTermThree, dates, callback) {
  var query = {
    location: searchTermOne,
    keywords: searchTermTwo,
    date: dates,
    within: searchTermThree,
    units: 'mi',
    sort_order: 'date',
    app_key: config.app_key
  };

  $.ajax({
    url: EVENTFUL_SEARCH_URL,
    data: query,
    dataType: 'jsonp', // to allow cross-origin access control
    success: callback,
    error: function error() {
      console.log("error");
    }
  });
}
function renderResult(result) {
  //used concatenation so that it works on all the browsers
  return '<div class="result-displayed"> ' +
            '<div class="image">' +
               '<a class="js-result-title" href="' + result.url + '" target="_blank">'+
                  '<div class="img" style="background-image:url(\'' + result.image.medium.url + '\')" alt="Sorry! This image does not exist!"> </div>'+
               '</a>'+
              '<p>Click on the Image for more details!</p>'+
            '</div>'+
            '<div class="text">' +
              '<h2 id="title">' + result.title + ' </h2>'+
              '<h4>' + result.start_time + '</h4>'+
              '<h3>' + result.city_name + '</h3>'+
              '<p>Check out ' + result.title + '!</p>'+
            '</div>'+
            '<div class="clear"></div>' +
          '</div>';
}

function displayEventfulSearchData(data) {
  // give an alert if there are no results
  if (!data.events) {
    alert("No results found!");
    return false;
  }

  var results = data.events.event.map(function (item, index) { //removed fat arrow function so that the results are rendered on all the browsers
    //if image is 'null' in json response, set a default image
    if (item.image === null) {
      item.image = { medium: { url: 'https://media.licdn.com/mpr/mpr/AAEAAQAAAAAAAAfTAAAAJGUzYWU5MjNlLWUyYmItNGEyYi05OWM4LWNkYzI0NGU2YWZmNQ.jpg' } };
    } else {
      item.image.medium.url = 'https:' + item.image.medium.url; //prefix the image url with https
    }

    item.start_time = moment(item.start_time).format('dddd, MMMM Do YYYY, h:mm a'); //set the date and time format as day, month, date, year, time(using moments plugin)

    return renderResult(item);
  });
  if (data.total_items > 10) {
    //if total items are greater than 10, show 'Top 10' results
    data.total_items = "Top 10";
  }

  $('.js-search-results').html('<h1>Results</h1>' + ('<h4>' + data.total_items + ' result' + (data.total_items !== 0 && data.total_items !== 1 ? 's' : '') + '\n     </h4>')); // if result is not equal to 0 or 1, set the word as results in the end
  $(".results").html(results);
}

function watchSubmit() {
  //ask permission and track the user's location
  navigator.geolocation.getCurrentPosition(function (o) {
    console.log(o);$('#location').val(o.coords.latitude + "," + o.coords.longitude);
  });

  $(function () {
    $(".datepicker").datepicker();
  });

  $('.js-search-form').submit(function (event) {
    event.preventDefault();
    event.stopPropagation();
    var searchTermOne = $("#location").val();
    var searchTermTwo = $("#keyword").val();
    var startDate = $("#start_date").val();
    var endDate = $("#end_date").val();
    var searchTermThree = $("#miles").val();
    var start_date = moment(startDate).format('YYYYMMDD00'); // date should be set in yymmdd00 format(using moments plugin) to send a request to json.
    var end_date = moment(endDate).format('YYYYMMDD00');
    var dates = start_date + '-' + end_date; //dates should contain the starting and end date to be sent to json

    getDataFromApi(searchTermOne, searchTermTwo, searchTermThree, dates, displayEventfulSearchData);
  });
}

$(watchSubmit);
