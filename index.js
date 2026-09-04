const btn1=document.getElementById("btn1");
const result=document.getElementById("result");
const cityInput=document.getElementById("cityInput");
async function getWeatherData()
{
    try
    {
        const city=cityInput.value.trim();
        if(city==="")
        {
            result.textContent="Please Enter a city name."
        }
        result.textContent="Loading Weather...";
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        if(!geoResponse.ok)
        {
            throw new Error("Something went wrong!");
        }
        const geoData=await geoResponse.json();
        
        if(!geoData.results || geoData.results.length===0)
        {
            throw new Error("City Not Found!");
        }
    
        const latitude=geoData.results[0].latitude;
        const longitude=geoData.results[0].longitude;

        const cityName=geoData.results[0].name;
        
        const url =`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,surface_pressure,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=5&timezone=auto`;
        const response = await fetch(url);

        if(!response.ok)
        {
            throw new Error("Something went wrong!");
        }

        const data=await response.json();
        const temperature=data.current.temperature_2m;
        const wind=data.current.wind_speed_10m;
        const humidity=data.current.relative_humidity_2m;
        const pressure=data.current.surface_pressure;
        const condition=getWeatherCondition(data.current.weather_code);
        result.innerHTML = `
        <div class="current-weather">
            <h2>${cityName}</h2>
            <p>${condition}</p>
            <p>Temperature: ${temperature}°C</p>
            <div class="weather-details">
                <p>Wind: ${wind} km/h</p>
                <p>Humidity: ${humidity}%</p>
                <p>Pressure: ${pressure} hPa</p>
            </div>
        </div>`;
        const forecast=data.daily.time.map((date,index)=>
        {
            return{
                date:date,
                max:data.daily.temperature_2m_max[index],
                min:data.daily.temperature_2m_min[index],
                condition:getWeatherCondition(data.daily.weather_code[index])
            };
        });
        result.innerHTML+=`
        <h2 class="forecast-title">5-days Forecast</h2> 
        <div class="forecast-container"></div>`;
        const forecastContainer=result.querySelector(".forecast-container");
        forecast.forEach(day=>
        {
            forecastContainer.innerHTML+=`
            <div class="forecast-card">
                <h3>${day.date}</h3>
                <p class="condition">${day.condition}</p>
                <p class="high">High:${day.max}°C</p>
                <p class="low">Low:${day.min}°C</p>
            </div>`
        }
        );
    }
    catch(error)
    {
        result.innerHTML = `<p class="error-message">${error.message}</p>`;
        console.log(error);
    }
}
function getWeatherCondition(code)
{
    if (code === 0)
    {
        return "Clear sky";
    }
    else if (code >= 1 && code <= 3)
    {
        return "Cloudy";
    }
    else if (code === 45 || code === 48)
    {
        return "Fog";
    }
    else if (code >= 51 && code <= 57)
    {
        return "Drizzle";
    }
    else if (code >= 61 && code <= 67)
    {
        return "Rain";
    }
    else if (code >= 71 && code <= 77)
    {
        return "Snow";
    }
    else if (code >= 80 && code <= 82)
    {
        return "Rain showers";
    }
    else if (code >= 85 && code <= 86)
    {
        return "Snow showers";
    }
    else if (code >= 95 && code <= 99)
    {
        return "Thunderstorm";
    }
    else
    {
        return "Unknown";
    }
}
btn1.addEventListener("click",getWeatherData);