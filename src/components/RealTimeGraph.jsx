import React, { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const RealTimeGraph = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://iotrestapi.onrender.com/iot/api/getRegistros');

        if (response.data && Array.isArray(response.data.data)) {
          const formattedData = response.data.data.map((item) => ({
            id_cuarto: item.id_cuarto,
            time: item.fecha_gmt6, // Use the GMT6 date as the x-axis value
            temp: item.temp,
            humedad: item.humedad,
            calidad: item.calidad,
          }));

          // Keep only the last 50 entries
          setData(formattedData.slice(-50));
        } else {
          setError('Unexpected API response format');
        }
      } catch (err) {
        setError(err.message);
      }
    };

    // Fetch data initially and set up polling
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Helper function to filter data by cuarto
  const filterDataByCuarto = (cuartoId) =>
    data.filter((item) => item.id_cuarto === cuartoId);

  return (
    <div>
      {error && <p>Error: {error}</p>}
      {data.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <div>
          {/* Temperature Graph */}
          <h3>Temperature Over Time</h3>
          <LineChart width={800} height={400} data={data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="temp"
              data={filterDataByCuarto(1)}
              stroke="#8884d8"
              name="Cuarto 1"
            />
            <Line
              type="monotone"
              dataKey="temp"
              data={filterDataByCuarto(2)}
              stroke="#82ca9d"
              name="Cuarto 2"
            />
            <Line
              type="monotone"
              dataKey="temp"
              data={filterDataByCuarto(3)}
              stroke="#ff7300"
              name="Cuarto 3"
            />
          </LineChart>

          {/* Humidity Graph */}
          <h3>Humidity Over Time</h3>
          <LineChart width={800} height={400} data={data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="humedad"
              data={filterDataByCuarto(1)}
              stroke="#8884d8"
              name="Cuarto 1"
            />
            <Line
              type="monotone"
              dataKey="humedad"
              data={filterDataByCuarto(2)}
              stroke="#82ca9d"
              name="Cuarto 2"
            />
            <Line
              type="monotone"
              dataKey="humedad"
              data={filterDataByCuarto(3)}
              stroke="#ff7300"
              name="Cuarto 3"
            />
          </LineChart>

          {/* Air Quality Graph */}
          <h3>Air Quality Over Time</h3>
          <LineChart width={800} height={400} data={data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="calidad"
              data={filterDataByCuarto(1)}
              stroke="#8884d8"
              name="Cuarto 1"
            />
            <Line
              type="monotone"
              dataKey="calidad"
              data={filterDataByCuarto(2)}
              stroke="#82ca9d"
              name="Cuarto 2"
            />
            <Line
              type="monotone"
              dataKey="calidad"
              data={filterDataByCuarto(3)}
              stroke="#ff7300"
              name="Cuarto 3"
            />
          </LineChart>
        </div>
      )}
    </div>
  );
};

export default RealTimeGraph;
