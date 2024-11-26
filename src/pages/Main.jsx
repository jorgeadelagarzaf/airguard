import React, { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import axios from 'axios';
//import { timeAgo } from '../utils/timeAgo.js';
import RangeSlider from '../components/RangeSlider';

// Utility function to calculate "time ago"
const timeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) return `Hace ${seconds} segundos`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} horas`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} dias`;
};

const Main = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('temp'); // Default to temperature
  const [scale, setScale] = useState('last50'); // Default scale: last 50 records
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://iotrestapi.onrender.com/iot/api/getRegistros');

        if (response.data && Array.isArray(response.data.data)) {
          const formattedData = response.data.data.map((item) => ({
            id_cuarto: item.id_cuarto,
            time: item.fecha_gmt6,
            temp: item.temp,
            humedad: item.humedad,
            calidad: item.calidad,
            timeAgo: timeAgo(item.fecha_gmt6),
          }));

          setData(formattedData);
        } else {
          setError('Unexpected API response format');
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const now = new Date();

    // Group data by timestamp
    const groupedData = {};
    data.forEach((item) => {
      const key = item.time;
      if (!groupedData[key]) {
        groupedData[key] = { time: item.time, timeAgo: item.timeAgo, Cuarto1: null, Cuarto2: null, Cuarto3: null };
      }
      groupedData[key][`Cuarto${item.id_cuarto}`] = item[selectedMetric];
    });

    // Convert grouped data back to an array
    const alignedData = Object.values(groupedData);

    // Apply scale filter
    if (scale === 'last50') {
      setFilteredData(alignedData.slice(-50));
    } else if (scale === 'lastHour') {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      setFilteredData(alignedData.filter((item) => new Date(item.time) >= oneHourAgo));
    } else if (scale === 'all') {
      setFilteredData(alignedData);
    }
  }, [data, scale, selectedMetric]);

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      {data.length === 0 ? (
        <p>Cargando...</p>
      ) : (
        <div className="w-full max-w-screen-lg space-y-8">

          {/* Dynamic Graph */}
          <div className="bg-gray-900 shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-center mb-4">
              {selectedMetric === 'temp' && 'Temperatura'}
              {selectedMetric === 'humedad' && 'Humedad'}
              {selectedMetric === 'calidad' && 'Calidad del aire'}
            </h3>
            <LineChart width={800} height={400} data={filteredData} className="mx-auto">
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="timeAgo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Cuarto1" stroke="#8884d8" name="Cuarto 1" connectNulls />
              <Line type="monotone" dataKey="Cuarto2" stroke="#82ca9d" name="Cuarto 2" connectNulls />
              <Line type="monotone" dataKey="Cuarto3" stroke="#ff7300" name="Cuarto 3" connectNulls />
            </LineChart>
          </div>

          {/* Buttons to switch metrics */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setSelectedMetric('temp')}
              className={`px-4 py-2 rounded ${
                selectedMetric === 'temp' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Temperatura
            </button>
            <button
              onClick={() => setSelectedMetric('humedad')}
              className={`px-4 py-2 rounded ${
                selectedMetric === 'humedad' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Humedad
            </button>
            <button
              onClick={() => setSelectedMetric('calidad')}
              className={`px-4 py-2 rounded ${
                selectedMetric === 'calidad' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Calidad del aire
            </button>
          </div>

          {/* Buttons to control scale */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setScale('last50')}
              className={`px-4 py-2 rounded ${
                scale === 'last50' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Ultimos 50 registros
            </button>
            <button
              onClick={() => setScale('lastHour')}
              className={`px-4 py-2 rounded ${
                scale === 'lastHour' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Ultima Hora
            </button>
            <button
              onClick={() => setScale('all')}
              className={`px-4 py-2 rounded ${
                scale === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Todos los Registros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
