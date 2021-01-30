const ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, {
  type: 'line',
  data: {
  labels: [],
  datasets: [{
    label: "",
    data: [],
    fill: false,
    borderColor: 'rgba(255, 99, 132, 1)',
    borderWidth: 1
  }],
  options: {
    responsive: true,
    scales: {
      xAxes: [{
        ticks: {
          maxTicksLimit: 10,
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: "Temperature in Celsius",
          padding: 20
        }
      }]
    }    
  }
}
});

const stationURL = "https://api.meteostat.net/v2/stations/search";
const dataURL = "https://api.meteostat.net/v2/stations/daily";

async function getData(){
  const city = document.getElementById('city').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  console.log({city, startDate, endDate})

  if(!(city && startDate && endDate))  {
    alert('Please input all data.');
    return;
  }

  let url = new URL(stationURL); // Create a URL object. 
  url.search = new URLSearchParams({ // Use URLSearchParams class to modify its query parameter. 
    query: city
  });

  let promise = await fetch(url, { // Make a request to find weather stations based on the city we want. 
    headers: {
      "x-api-key": "fQk1CO7xJjZhEpZAqadInZbdczalBIRV" // Include API Key to authenticate the request. 
    },
  });
  let data = await promise.json(); // Convert the response to JSON format. 
  console.log(data);

  if (!data.data) { // If no data then return the function.
    alert('No data available for the city.');
    return; 
  }
  const stationID = data.data[0].id; // Pick the ID of the first weather station. 
  const graphData = await retrieveData(stationID, startDate, endDate); // Use the Station ID to get weather data. 
  if (!graphData) return; // If no data from first weather station then return. 
  updateChart(graphData, city); // Update the chart.

}

async function retrieveData(id, start, end) { // This function also has to be async because we'll be making another fetch() request. 
  const xDates = []; 
  const yTemps = [];

  let url = new URL(dataURL); // Remember, dataURL is the global variable we defined at the beginning of the JS file. 
  url.search = new URLSearchParams({ // Add required parameters to retrieve weather data from a specific station. 
    station: id, 
    start: start,
    end: end
  });

  let promise = await fetch(url, {
    headers: {
      "x-api-key": "fQk1CO7xJjZhEpZAqadInZbdczalBIRV" // Include API Key to authenticate the request. 
    },
  });
  let data = await promise.json(); // Convert the response to JSON format. 

  console.log(data)

  if (data.data && data.data[0].tavg) { // Make sure that there is weather data in the API response. 
  for (day of data.data) { // Iterate through the array of objects and add the average temperature and date to the xDates and yTemps array. 
    xDates.push(day.date);
    yTemps.push(day.tavg);
  }
  return { xDates, yTemps };
} else { // If there's no weather data for us to use, simply alert to user and terminate the program. 
  alert("No data available for this city.");
  return false;
}
}

function updateChart(inputData, cityName) {
  const newData = {
    label: `Average temperature in ${cityName}`,
      data: inputData.yTemps,
      fill: false,
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
  };
  myChart.data.datasets[0] = newData;
  myChart.data.labels = inputData.xDates;
  myChart.update();    
}