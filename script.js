const iconos_clima = {
    0: { file: "unknown", d: "Desconocido" },
    1000: { file: "day_clear", d: "Despejado" },
    1001: { file: "overcast", d: "Nublado" },
    1100: { file: "day_partial_cloud", d: "Nubes dispersas" },
    1101: { file: "day_partial_cloud", d: "Parcialmente nublado" },
    1102: { file: "overcast", d: "Nublado" },
    2000: { file: "fog", d: "Niebla" },
    2100: { file: "fog", d: "Niebla ligera" },
    3000: { file: "wind", d: "Ventoso" },
    3001: { file: "wind", d: "Ventoso" },
    3002: { file: "wind", d: "Ventoso" },
    4000: { file: "rain", d: "Lluvia ligera" },
    4001: { file: "rain", d: "Lluvia" },
    4200: { file: "rain", d: "Lluvia moderada" },
    4201: { file: "rain", d: "Lluvia intensa" },
    5000: { file: "snow", d: "Nevada ligera" },
    5001: { file: "snow", d: "Nieve" },
    5100: { file: "snow", d: "Nevada moderada" },
    5101: { file: "snow", d: "Nevada intensa" },
    6000: { file: "sleet", d: "Aguanieve ligera" },
    6001: { file: "sleet", d: "Aguanieve" },
    6200: { file: "sleet", d: "Aguanieve ligera" },
    6201: { file: "sleet", d: "Aguanieve intensa" },
    7000: { file: "thunder", d: "Tormenta eléctrica" },
    7100: { file: "thunder", d: "Tormenta eléctrica ligera" },
    7101: { file: "thunder", d: "Tormenta eléctrica severa" },
    8000: { file: "hail", d: "Granizo" }
    // Puedes agregar más códigos si es necesario
};


const dias = ['Domingo',  // Agrega el Domingo como el primer elemento del arreglo
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'
];

// Search
const queryParams = new URLSearchParams(window.location.search)
// Quite las API Keys para hacerlo publico
// GCloud API Key
const apiKey = 'your G-Cloud APIKey',
    tioApi = 'your tomorrow io APIKey'
let city = queryParams.get('c') || queryParams.get('city') || 'Los Mochis';
console.log(city);
async function obtenerCoordenadas(query) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const location = data.results[0].geometry.location;
    return {
        coordenadas: `${location.lat},${location.lng}`,
        ciudad: data.results[0].formatted_address,
        cc: location
    };
}

async function fetchWeatherData(city) {
    try {
        const location = await obtenerCoordenadas(city);
        // const url = `./forecast.json`;
        const url = `./mexicali.json`;
        // const url = `https://api.tomorrow.io/v4/weather/forecast?location=${location.coordenadas}&apikey=${tioApi}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        data.location = location;
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return null;
    }
}


const kelvin = 273.15;
let weatherData;
let defaultLocation;

// async function jsonsito() {
//     try {
//         const url = `cagada.json`;
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error('Network response was not ok.');
//         }
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error('There was a problem with the fetch operation:', error);
//         return null;
//     }
// }

async function datos() {
    weatherData = await fetchWeatherData(city);
    initMap(weatherData.location.cc);

    main();
    renderTemperatureTrends(weatherData);
    generarAlertasConFecha(weatherData);
    cargarHistorial();
}
let added = false;
// Función para cargar el historial desde localStorage
function cargarHistorial() {
    const historialString = localStorage.getItem('historial');
    if (!historialString) return;

    const historial = JSON.parse(historialString);

    const listaHistorial = document.getElementById('historial-lista');

    // Limpiar la lista antes de agregar nuevos elementos
    listaHistorial.innerHTML = '';

    historial.forEach(consulta => {
        const ciudad = Object.keys(consulta)[0];
        const fecha = consulta[ciudad];

        // Crear el elemento li
        const item = document.createElement('li');
        item.className = 'historial-item';

        // Crear un span para la ciudad y agregarla al li
        const ciudadSpan = document.createElement('span');
        ciudadSpan.textContent = ciudad;
        item.appendChild(ciudadSpan);

        // Crear un span para la fecha y hora de consulta y agregarla al li
        const fechaSpan = document.createElement('span');
        fechaSpan.textContent = fecha;
        item.appendChild(fechaSpan);

        // Crear el botón de eliminar y agregarlo al li
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'X';
        botonEliminar.className = 'eliminar-btn';
        botonEliminar.onclick = function () {
            eliminarConsulta(ciudad);
        eliminarConsulta(ciudad);
        };
        const botonVisitar = document.createElement('button');
        botonVisitar.textContent = '¬';
        botonVisitar.className = 'visit-btn';
        botonVisitar.onclick = function () {location.href ='/?c='+city}
        const btns = document.createElement('div');
        btns.style.display = 'flex'
        const split = document.createElement('div');
        split.style.width ='14px'
        btns.appendChild(botonVisitar);
        btns.appendChild(split);
        btns.appendChild(botonEliminar);
        item.appendChild(btns);
        // Agregar el li a la lista
        listaHistorial.appendChild(item);
    });
    if (!added)agregarConsulta(city);
}

// Función para eliminar una consulta del historial
function eliminarConsulta(ciudad) {
    const historialString = localStorage.getItem('historial');
    if (!historialString) return;

    let historial = JSON.parse(historialString);

    historial = historial.filter(consulta => Object.keys(consulta)[0] !== ciudad);

    localStorage.setItem('historial', JSON.stringify(historial));

    cargarHistorial();
}

// Función para agregar una consulta al historial
function agregarConsulta(ciudad) {
    if (added) return;
    added = true;
    let historialString = localStorage.getItem('historial');
    let historial = historialString ? JSON.parse(historialString) : [];

    // Obtener la fecha y hora actual
    const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Verificar si la ciudad ya existe en el historial
    const indice = historial.findIndex(consulta => Object.keys(consulta)[0] === ciudad);

    // Si la ciudad ya existe en el historial, actualizar la fecha
    if (indice !== -1) {
        historial[indice][ciudad] = fechaActual;
    } else {
        // Si la ciudad no existe en el historial, agregarla al principio
        const nuevaConsulta = { [ciudad]: fechaActual };
        historial.unshift(nuevaConsulta);

        // Limitar el historial a un máximo de, por ejemplo, 10 elementos
        if (historial.length > 10) {
            historial = historial.slice(0, 10);
        }
    }

    // Guardar el historial actualizado en el localStorage
    localStorage.setItem('historial', JSON.stringify(historial));

    // Recargar el historial
    cargarHistorial();
}


let rendered = false;
let _hourlyRow = null;
let _dailyRow = null;


// Cambia la vista entre hoy y semana
document.getElementById('view-selector').addEventListener('change', (event) => {
    const selectedView = event.target.value;
    if (selectedView === 'today') {
        renderTemperatureTrends(weatherData, true);
    } else if (selectedView === 'week') {
        renderTemperatureTrends(weatherData, false);
    }
});

// Renderiza tendencias de temperatura
function renderTemperatureTrends(data, today = false) { // Cambiado a false por defecto
    if (!rendered) {
        renderTodayTemperatureTrends(data);
        renderWeeklyTemperatureTrends(data);
        rendered = true;
    }

    if (today) {
        _hourlyRow.style.display = 'flex';
        _hourlyRow.style.flexDirection = 'row';
        _dailyRow.style.display = 'none';
    } else {
        _hourlyRow.style.display = 'none';
        _dailyRow.style.display = 'flex';
        _dailyRow.style.flexDirection = 'row';
    }
}

// Renderiza tendencias de temperatura diaria
function renderTodayTemperatureTrends(data) {
    const hourlyChart = document.getElementById('temperature-chart');

    const hourlyForecast = data.timelines.hourly.slice(0, 24); // Próximas 24 horas
    const hoursOfDay = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    const hourlyRow = document.createElement('div');
    hourlyRow.className = 'hourly-chart-row';
    hourlyForecast.forEach((hour, index) => {
        const temp = hour.values.temperature;
        const bar = document.createElement('div');
        const item = document.createElement('div');
        item.className = 'item';
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        bar.className = 'bar';
        bar.style.height = `${temp * 3}px`; // Ajustar el multiplicador según sea necesario
        bar.style.width = '2vh'; // Ajustar el ancho según sea necesario
        bar.title = `Temp: ${temp}°C`;

        // Agregar evento para mostrar temperatura al hacer hover
        bar.addEventListener('mouseenter', () => {
            bar.innerHTML = `<div style='font-weight:bolder;position:relative;top:-30px;left:-12px'>${temp}°C</div>`;
        });

        // Agregar evento para ocultar temperatura al salir del hover
        bar.addEventListener('mouseleave', () => {
            bar.innerHTML = ''; // Limpiar texto
        });

        const label = document.createElement('span');
        label.className = 'bar-label';
        label.innerText = hoursOfDay[index];

        item.appendChild(bar);
        item.appendChild(label);
        hourlyRow.appendChild(item);
    });
    _hourlyRow = hourlyRow;
    hourlyChart.appendChild(_hourlyRow);
}

// Renderiza tendencias de temperatura semanal
function renderWeeklyTemperatureTrends(data) {
    const weeklyChart = document.getElementById('temperature-chart');
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weeklyForecast = data.timelines.daily.slice(0, 7); // Próximos 7 días

    const currentDate = new Date(); // Obtener la fecha actual
    const currentDayIndex = currentDate.getDay(); // Obtener el índice del día actual (0 para domingo, 1 para lunes, etc.)

    const daysOfWeekStartingToday = daysOfWeek.slice(currentDayIndex).concat(daysOfWeek.slice(0, currentDayIndex)); // Ajustar los días de la semana para empezar desde el día actual

    const weeklyRow = document.createElement('div');
    weeklyRow.className = 'weekly-chart-row';
    weeklyForecast.forEach((day, index) => {
        const avgTemp = (day.values.temperatureMin + day.values.temperatureMax) / 2;
        const item = document.createElement('div');
        item.className = 'item';

        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${avgTemp * 3}px`; // Ajustar el multiplicador según sea necesario
        bar.style.width = '5vh'; // Ajustar el ancho según sea necesario
        bar.title = `Min: ${day.values.temperatureMin}°C, Max: ${day.values.temperatureMax}°C`;

        // Agregar evento para mostrar temperatura al hacer hover
        bar.addEventListener('mouseenter', () => {
            bar.innerHTML = `<div style='font-weight:bolder;position:relative;top:-30px;left:-8px'>${avgTemp.toFixed(2)}°C</div>`; // Mostrar temperatura con dos decimales
        });

        // Agregar evento para ocultar temperatura al salir del hover
        bar.addEventListener('mouseleave', () => {
            bar.innerHTML = ''; // Limpiar texto
        });

        const label = document.createElement('span');
        label.className = 'bar-label';
        label.innerText = daysOfWeekStartingToday[index % 7]; // Utilizar los días de la semana ajustados

        item.appendChild(bar);
        item.appendChild(label);
        weeklyRow.appendChild(item);
    });

    _dailyRow = weeklyRow;
    weeklyChart.appendChild(_dailyRow);
}

function main() {
    if (weatherData) {
        const rNow = new Date();
        const wNow = weatherData.timelines.daily[0].values;
        const avgTemp = wNow.temperatureAvg.toFixed(2);
        const maxTemp = wNow.temperatureMax.toFixed(2);
        const minTemp = wNow.temperatureMin.toFixed(2);
        const city = weatherData.location.ciudad;
        const code = weatherData.timelines.daily[0].values.weatherCodeMax || 1000;
        const description = iconos_clima[code];
        console.log(description);

        document.getElementById('avgTemp').innerHTML = avgTemp;
        document.getElementById('maxTemp').innerHTML = maxTemp;
        document.getElementById('minTemp').innerHTML = minTemp;
        document.getElementById('city').textContent = city;
        document.getElementById('day').textContent = dias[rNow.getDay()];
        document.getElementById('forecast-icon').src = `./weather/PNG/${description.file}.png`;
        document.getElementById('description').textContent = description.d;

        let colorClass = '10px solid ';
        const temperature = parseFloat(avgTemp);

        if (temperature < 15) {
            colorClass += 'blue';
        } else if (temperature >= 15 && temperature < 25) {
            colorClass += 'green';
        } else if (temperature >= 25 && temperature < 35) {
            colorClass += 'yellow';
        } else if (temperature >= 35 && temperature < 42) {
            colorClass += 'orange';
        } else {
            colorClass += 'red';
        }
    }
}
function initMap(defaultLocation = { lat: 25.7936, lng: -108.9981 }) {

    // Opciones del mapa
    const mapOptions = {
        center: defaultLocation,
        zoom: 10,
    };

    // Crear el mapa
    const map = new google.maps.Map(document.getElementById("google-map"), mapOptions);

    // Marcador de ubicación predeterminada
    const marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: "Mi ubicación"
    });
}

const host = '/?c=',
    searchBar = document.getElementById('searchBar')
function buscarCiudad() {
    window.location = `${host}${searchBar.value}`;
}


datos()

// Función para generar alertas meteorológicas con fecha
function generarAlertasConFecha(data) {
    const alertsContainer = document.querySelector('.alerts');
    alertsContainer.innerHTML = ''; // Limpiar alertas anteriores

    // Obtener datos relevantes del clima
    const dailyForecast = data.timelines.daily;

    // Recorrer los datos del pronóstico diario para generar alertas con fecha
    dailyForecast.forEach((day, index) => {
        const maxTemp = day.values.temperatureMax;
        const minTemp = day.values.temperatureMin;
        const weatherCode = day.values.weatherCodeMax;
        const date = new Date();
        date.setDate(date.getDate() + index); // Añadir el índice para obtener la fecha correcta

        // Obtener el nombre del día de la semana
        const dayOfWeek = dias[date.getDay()];

        // Ejemplo de criterio para generar alerta de lluvia
        if (weatherCode === 4001 || weatherCode === 4200 || weatherCode === 4201) {
            const alertElement = document.createElement('div');
            alertElement.className = 'alert bg-blue-200 p-2 rounded-md';
            alertElement.textContent = `¡Alerta de lluvia para ${dayOfWeek}! Prepárate para la lluvia.`;
            alertsContainer.appendChild(alertElement);
        }

        // Ejemplo de criterio para generar alerta de temperatura alta
        if (maxTemp > 35) {
            const alertElement = document.createElement('div');
            alertElement.className = 'alert bg-red-200 p-2 rounded-md';
            alertElement.textContent = `¡Alerta de temperatura alta para ${dayOfWeek}! Protégete del calor.`;
            alertsContainer.appendChild(alertElement);
        }

        // Ejemplo de criterio para generar alerta de temperatura baja
        if (minTemp < 5) {
            const alertElement = document.createElement('div');
            alertElement.className = 'alert bg-blue-200 p-2 rounded-md';
            alertElement.textContent = `¡Alerta de temperatura baja para ${dayOfWeek}! Abrígate bien.`;
            alertsContainer.appendChild(alertElement);
        }

        // Puedes agregar más criterios según sea necesario
    });
}

// Llama a la función para generar alertas con fecha cuando se carguen los datos del clima
datos()