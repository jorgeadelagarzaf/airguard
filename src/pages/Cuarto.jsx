import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';
import axios from 'axios';
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
  return `Hace ${days} días`;
};

const Cuarto = () => {
  const { id } = useParams(); // Get the cuarto ID from the route
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [scale, setScale] = useState('last50'); // Default scale: last 50 records
  const [ranges, setRanges] = useState(null); // Initially null to signify that it's not yet loaded
  const [error, setError] = useState(null);
  const [activeSensors, setActiveSensors] = useState({ temp: true, humedad: true, calidad: true });
  const [showAllRanges, setShowAllRanges] = useState(true);

  // Fetch range data for each sensor
  const fetchRanges = async () => {
    try {
      const sensors = ['temp', 'humedad', 'calidad'];
      const fetchedRanges = {};

      for (const sensor of sensors) {
        const payload = { sensor, id_cuarto: parseInt(id, 10) };
        const response = await axios.post(
          'https://iotrestapi.onrender.com/iot/api/getRange',
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );
        if (response.data && response.data.data) {
          const { minimum, maximum } = response.data.data[0];
          fetchedRanges[sensor] = { min: minimum, max: maximum };
        } else {
          throw new Error(`Failed to fetch range for ${sensor}`);
        }
      }

      setRanges(fetchedRanges);
    } catch (err) {
      setError(`Error fetching ranges: ${err.message}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://iotrestapi.onrender.com/iot/api/getRegistros');

        if (response.data && Array.isArray(response.data.data)) {
          const formattedData = response.data.data
            .filter((item) => item.id_cuarto === parseInt(id, 10)) // Filter by cuarto ID
            .map((item) => ({
              time: item.fecha_gmt6,
              temp: item.temp,
              humedad: item.humedad,
              calidad: item.calidad,
              timeAgo: timeAgo(item.fecha_gmt6), // Calculate "time ago"
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
    fetchRanges(); // Fetch ranges for sensors
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [id]);

  useEffect(() => {
    const now = new Date();
    if (scale === 'last50') {
      setFilteredData(data.slice(-50));
    } else if (scale === 'lastHour') {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      setFilteredData(data.filter((item) => new Date(item.time) >= oneHourAgo));
    } else if (scale === 'all') {
      setFilteredData(data);
    }
  }, [data, scale]);

  // Function to handle range update
  const handleRangeUpdate = (sensor, newRange) => {
    setRanges((prevRanges) => ({
      ...prevRanges,
      [sensor]: { min: newRange[0], max: newRange[1] },
    }));
  };

  // Function to toggle sensor visibility
  const toggleSensor = (sensor) => {
    setActiveSensors((prev) => ({
      ...prev,
      [sensor]: !prev[sensor],
    }));
  };

  // Function to toggle all reference lines
  const toggleAllRanges = () => {
    setShowAllRanges((prev) => !prev);
  };

  return (
    <div className="flex">

      {/* Chart Section */}
      <div className="w-3/4 max-w-screen-lg space-y-8">
        {error && <p className="text-red-500">{error}</p>}
        {data.length === 0 || !ranges ? (
          <p>Cargando...</p>
        ) : (
          <div className="bg-gray-900 shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-center mb-4">Datos del Cuarto {id}</h3>
            <LineChart width={800} height={400} data={filteredData} className="mx-auto">
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="timeAgo" />
              <YAxis />
              <Tooltip />
              <Legend />

              {/* Horizontal lines for sensor ranges */}
              {showAllRanges && activeSensors.temp && ranges.temp && (
                <>
                  <ReferenceLine y={ranges.temp.min} stroke="blue" strokeDasharray="3 3" label="Temp Min" />
                  <ReferenceLine y={ranges.temp.max} stroke="blue" strokeDasharray="3 3" label="Temp Max" />
                </>
              )}
              {showAllRanges && activeSensors.humedad && ranges.humedad && (
                <>
                  <ReferenceLine y={ranges.humedad.min} stroke="green" strokeDasharray="3 3" label="Humedad Min" />
                  <ReferenceLine y={ranges.humedad.max} stroke="green" strokeDasharray="3 3" label="Humedad Max" />
                </>
              )}
              {showAllRanges && activeSensors.calidad && ranges.calidad && (
                <>
                  <ReferenceLine y={ranges.calidad.min} stroke="orange" strokeDasharray="3 3" label="Calidad Min" />
                  <ReferenceLine y={ranges.calidad.max} stroke="orange" strokeDasharray="3 3" label="Calidad Max" />
                </>
              )}

              {activeSensors.temp && <Line type="monotone" dataKey="temp" stroke="#8884d8" name="Temperatura" />}
              {activeSensors.humedad && <Line type="monotone" dataKey="humedad" stroke="#82ca9d" name="Humedad" />}
              {activeSensors.calidad && <Line type="monotone" dataKey="calidad" stroke="#ff7300" name="Calidad del aire" />}
            </LineChart>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setScale('last50')}
            className={`px-4 py-2 rounded ${
              scale === 'last50' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Últimos 50 registros
          </button>
          <button
            onClick={() => setScale('lastHour')}
            className={`px-4 py-2 rounded ${
              scale === 'lastHour' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Última hora
          </button>
          <button
            onClick={() => setScale('all')}
            className={`px-4 py-2 rounded ${
              scale === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Todos los registros
          </button>
        </div>

        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={() => toggleSensor('temp')}
            className={`px-4 py-2 rounded ${
              activeSensors.temp ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Temperatura
          </button>
          <button
            onClick={() => toggleSensor('humedad')}
            className={`px-4 py-2 rounded ${
              activeSensors.humedad ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Humedad
          </button>
          <button
            onClick={() => toggleSensor('calidad')}
            className={`px-4 py-2 rounded ${
              activeSensors.calidad ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Calidad del Aire
          </button>
          <button
            onClick={toggleAllRanges}
            className={`px-4 py-2 rounded ${
              showAllRanges ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Lineas de Rango
          </button>
        </div>
      </div>

      {/* Sidebar for Range Sliders */}
      <div className="w-1/4 p-4 space-y-4">
        <h3 className="text-lg font-semibold">Ajustes de Sensores</h3>
        <RangeSlider sensor="temp" idCuarto={id} onRangeUpdate={handleRangeUpdate} />
        <RangeSlider sensor="humedad" idCuarto={id} onRangeUpdate={handleRangeUpdate} />
        <RangeSlider sensor="calidad" idCuarto={id} onRangeUpdate={handleRangeUpdate} />
      </div>
    </div>
  );
};

export default Cuarto;
