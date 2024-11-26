import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactSlider from 'react-slider';

const RangeSlider = ({ sensor, idCuarto, onRangeUpdate }) => {
  // Map default ranges for each sensor
  const defaultRanges = {
    temp: { min: 0, max: 40 },
    humedad: { min: 0, max: 100 },
    calidad: { min: 0, max: 1000 },
  };

  // Initialize range state based on the sensor
  const [range, setRange] = useState(defaultRanges[sensor] || { min: 0, max: 100 });
  const [sliderValue, setSliderValue] = useState([range.min, range.max]); // Slider state
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Function to fetch range data from the API
    const fetchRange = async () => {
      try {
        const payload = {
          sensor,
          id_cuarto: idCuarto,
        };

        const response = await axios.post(
          'https://iotrestapi.onrender.com/iot/api/getRange',
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data && response.data.data) {
          const { minimum, maximum } = response.data.data[0];
          setSliderValue([minimum, maximum]); // Set slider to match the fetched range
        } else {
          setError('Unexpected API response format');
        }
      } catch (err) {
        setError(`Failed to fetch range: ${err.message}`);
      }
    };

    fetchRange();
  }, [sensor, idCuarto]); // Re-run when sensor or idCuarto changes

  const updateRange = async (newRange) => {
    try {
      const payload = {
        minimum: newRange[0],
        maximum: newRange[1],
        sensor,
        id_cuarto: idCuarto,
      };

      const response = await axios.post(
        'https://iotrestapi.onrender.com/iot/api/changeRange',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Make sure `response` is properly used here
      if (response.status === 200) {
        setSuccessMessage('Range updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000); // Clear the success message after 3 seconds
      } else {
        throw new Error('Failed to update range');
      }
    } catch (err) {
      setError(`Failed to update range: ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-gray-900 shadow-md rounded-lg w-full mx-2">
      <h3 className="text-lg font-semibold mb-4">Rango de {sensor}</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!error && (
        <div>
          <ReactSlider
            className="horizontal-slider"
            thumbClassName="example-thumb"
            trackClassName="example-track"
            min={range.min}
            max={range.max}
            value={sliderValue}
            onChange={(value) => {
              setSliderValue(value);
              onRangeUpdate(sensor, value); // Update the range in the parent instantly
            }}
            onAfterChange={(value) => updateRange(value)} // Optional: Only update the backend after slider release
            renderThumb={(props, state) => (
              <div {...props}>{state.valueNow}</div>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default RangeSlider;
