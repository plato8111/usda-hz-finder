<template>
  <div class="usda-hz-finder">
    <!-- Optional UI for testing/debugging -->
    <!-- wwEditor:start -->
    <div v-if="isEditing" class="editor-preview">
      <div class="preview-header">
        <h3>USDA Hardiness Zone Finder (Data Provider)</h3>
        <p class="preview-note">This component provides data. Connect it to your map and UI components.</p>
      </div>

      <div class="preview-status">
        <div class="status-item">
          <span class="label">Status:</span>
          <span class="value" :class="statusClass">{{ status }}</span>
        </div>
        <div class="status-item" v-if="currentLocation?.lat">
          <span class="label">Location:</span>
          <span class="value">{{ currentLocation.lat.toFixed(4) }}°, {{ currentLocation.lng.toFixed(4) }}°</span>
        </div>
        <div class="status-item" v-if="calculatedZone">
          <span class="label">Zone:</span>
          <span class="value zone-badge">{{ calculatedZone }}</span>
        </div>
      </div>

      <div class="preview-actions">
        <button @click="handleRequestGeolocation" :disabled="isLoading" class="action-btn">
          📍 Request Geolocation
        </button>
        <button @click="handleTestLocation" :disabled="isLoading" class="action-btn">
          🧪 Test (Warsaw)
        </button>
        <button @click="handleClearResults" class="action-btn">
          🗑️ Clear
        </button>
      </div>

      <div v-if="availableStations?.length > 0" class="preview-data">
        <h4>Available Stations ({{ availableStations.length }})</h4>
        <div class="station-list">
          <div
            v-for="station in availableStations.slice(0, 3)"
            :key="station.id"
            class="station-item"
          >
            <span class="station-name">{{ station.name }}</span>
            <span class="station-distance">{{ station.distance }}km</span>
            <span class="station-quality" :style="{ color: station.quality?.color }">
              {{ station.quality?.level }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="preview-error">
        <strong>Error:</strong> {{ errorMessage }}
        <div v-if="errorSuggestions?.length > 0" class="error-suggestions">
          <strong>Suggestions:</strong>
          <ul>
            <li v-for="(suggestion, idx) in errorSuggestions" :key="idx">{{ suggestion }}</li>
          </ul>
        </div>
      </div>

      <div class="preview-info">
        <p><strong>📍 Connect to Map Component:</strong></p>
        <ul>
          <li>Input Latitude → Bind to [Map].clickedLocation.lat</li>
          <li>Input Longitude → Bind to [Map].clickedLocation.lng</li>
          <li>OR: [Map].geoLocation.lat / .lng for geolocation</li>
        </ul>

        <p><strong>📊 Internal Variables Exposed:</strong></p>
        <ul>
          <li>currentLocation: { lat, lng }</li>
          <li>calculatedZone: string (e.g., "7b")</li>
          <li>minTemperature: number (raw °F)</li>
          <li>minTemperatureConverted: number (converted to selected unit)</li>
          <li>temperatureUnitLabel: string (°F or °C)</li>
          <li>availableStations: array (with quality indicators, km)</li>
          <li>availableStationsConverted: array (with converted distances)</li>
          <li>distanceUnitLabel: string (km or mi)</li>
          <li>selectedStation: object</li>
          <li>frostDates: { lastSpringFrost, firstFallFrost }</li>
          <li>calendarEvents: array (planting schedule)</li>
          <li>moistureZone: object (precipitation data)</li>
          <li>extremeWeather: array</li>
          <li>status: "idle" | "loading" | "success" | "error"</li>
          <li>isLoading: boolean</li>
          <li>errorMessage: string</li>
        </ul>
      </div>
    </div>
    <!-- wwEditor:end -->
  </div>
</template>

<script>
export default {
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },

  setup(props, { emit }) {
    const { ref, computed, watch, onMounted, onBeforeUnmount } = window.Vue;

    /* wwEditor:start */
    const isEditing = computed(() => props.wwEditorState?.isEditing || false);
    /* wwEditor:end */

    // ========================================
    // INTERNAL VARIABLES (Exposed to WeWeb)
    // ========================================

    const { value: currentLocation, setValue: setCurrentLocation } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'currentLocation',
        type: 'object',
        defaultValue: { lat: null, lng: null },
      });

    const { value: calculatedZone, setValue: setCalculatedZone } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'calculatedZone',
        type: 'string',
        defaultValue: '',
      });

    const { value: minTemperature, setValue: setMinTemperature } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'minTemperature',
        type: 'number',
        defaultValue: null,
      });

    const { value: minTemperatureConverted, setValue: setMinTemperatureConverted } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'minTemperatureConverted',
        type: 'number',
        defaultValue: null,
      });

    const { value: temperatureUnitLabel, setValue: setTemperatureUnitLabel } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'temperatureUnitLabel',
        type: 'string',
        defaultValue: '°F',
      });

    const { value: availableStations, setValue: setAvailableStations } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'availableStations',
        type: 'array',
        defaultValue: [],
      });

    const { value: availableStationsConverted, setValue: setAvailableStationsConverted } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'availableStationsConverted',
        type: 'array',
        defaultValue: [],
      });

    const { value: distanceUnitLabel, setValue: setDistanceUnitLabel } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'distanceUnitLabel',
        type: 'string',
        defaultValue: 'km',
      });

    const { value: selectedStation, setValue: setSelectedStation } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'selectedStation',
        type: 'object',
        defaultValue: null,
      });

    const { value: frostDates, setValue: setFrostDates } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'frostDates',
        type: 'object',
        defaultValue: null,
      });

    const { value: calendarEvents, setValue: setCalendarEvents } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'calendarEvents',
        type: 'array',
        defaultValue: [],
      });

    const { value: moistureZone, setValue: setMoistureZone } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'moistureZone',
        type: 'object',
        defaultValue: null,
      });

    const { value: extremeWeather, setValue: setExtremeWeather } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'extremeWeather',
        type: 'array',
        defaultValue: [],
      });

    const { value: analysisResult, setValue: setAnalysisResult } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'analysisResult',
        type: 'object',
        defaultValue: null,
      });

    const { value: status, setValue: setStatus } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'status',
        type: 'string',
        defaultValue: 'idle', // idle | loading | success | error
      });

    const { value: isLoading, setValue: setIsLoading } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'isLoading',
        type: 'boolean',
        defaultValue: false,
      });

    const { value: errorMessage, setValue: setErrorMessage } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'errorMessage',
        type: 'string',
        defaultValue: '',
      });

    const { value: errorSuggestions, setValue: setErrorSuggestions } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'errorSuggestions',
        type: 'array',
        defaultValue: [],
      });

    // ========================================
    // COMPUTED PROPERTIES
    // ========================================

    const inputLatitude = computed(() => props.content?.inputLatitude);
    const inputLongitude = computed(() => props.content?.inputLongitude);
    const autoCalculateOnLocationChange = computed(() => props.content?.autoCalculateOnLocationChange ?? true);

    const temperatureUnit = computed(() => props.content?.temperatureUnit || 'F');
    const distanceUnit = computed(() => props.content?.distanceUnit || 'km');

    const supabaseUrl = computed(() => props.content?.supabaseUrl || '');
    const supabaseAnonKey = computed(() => props.content?.supabaseAnonKey || '');
    const calculationMode = computed(() => props.content?.calculationMode || 'auto');
    const searchRadius = computed(() => props.content?.searchRadius || 2);
    const stationLimit = computed(() => props.content?.stationLimit || 10);
    const analysisYears = computed(() => props.content?.analysisYears || 30);

    const microclimateFactors = computed(() => {
      if (!props.content?.enableMicroclimate) return null;
      return {
        nearWater: props.content?.nearWater || false,
        urbanArea: props.content?.urbanArea || false,
        windExposed: props.content?.windExposed || false,
        southFacing: props.content?.southFacing || false,
      };
    });

    const statusClass = computed(() => {
      const s = status.value;
      if (s === 'loading') return 'status-loading';
      if (s === 'success') return 'status-success';
      if (s === 'error') return 'status-error';
      return 'status-idle';
    });

    // ========================================
    // CONVERSION UTILITIES
    // ========================================

    function convertTemperature(fahrenheit, toUnit) {
      if (fahrenheit === null || fahrenheit === undefined) return null;
      if (toUnit === 'C') {
        return Math.round(((fahrenheit - 32) * 5 / 9) * 10) / 10;
      }
      return fahrenheit;
    }

    function convertDistance(kilometers, toUnit) {
      if (kilometers === null || kilometers === undefined) return null;
      if (toUnit === 'miles') {
        return Math.round(kilometers * 0.621371 * 10) / 10;
      }
      return kilometers;
    }

    function getTemperatureUnitLabel(unit) {
      return unit === 'C' ? '°C' : '°F';
    }

    function getDistanceUnitLabel(unit) {
      return unit === 'miles' ? 'mi' : 'km';
    }

    // Update converted values when units or raw values change
    watch(
      () => [minTemperature.value, temperatureUnit.value],
      () => {
        const converted = convertTemperature(minTemperature.value, temperatureUnit.value);
        setMinTemperatureConverted(converted);
        setTemperatureUnitLabel(getTemperatureUnitLabel(temperatureUnit.value));
      },
      { immediate: true }
    );

    watch(
      () => [availableStations.value, distanceUnit.value],
      () => {
        const stations = availableStations.value || [];
        const converted = stations.map(station => ({
          ...station,
          distance: convertDistance(station.distance, distanceUnit.value),
          distanceRaw: station.distance, // Keep original
        }));
        setAvailableStationsConverted(converted);
        setDistanceUnitLabel(getDistanceUnitLabel(distanceUnit.value));
      },
      { immediate: true, deep: true }
    );

    // ========================================
    // API FUNCTIONS
    // ========================================

    async function callEdgeFunction(functionName, payload) {
      const url = `${supabaseUrl.value}/functions/v1/${functionName}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey.value}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      return await response.json();
    }

    async function calculateHardiness(lat, lng) {
      setIsLoading(true);
      setStatus('loading');
      setErrorMessage('');
      setErrorSuggestions([]);

      try {
        const payload = {
          lat,
          lng,
          mode: calculationMode.value,
          radius: searchRadius.value,
          limit: stationLimit.value,
          years: analysisYears.value,
        };

        // Add optional enhancements
        if (props.content?.userElevation !== null && props.content?.userElevation !== undefined) {
          payload.elevation = props.content?.userElevation;
        }

        if (microclimateFactors.value) {
          payload.microclimate = microclimateFactors.value;
        }

        console.log('Calling hardiness-zone-hybrid with:', payload);
        const result = await callEdgeFunction('hardiness-zone-hybrid', payload);

        console.log('Hardiness calculation result:', result);

        // Update all internal variables
        setAnalysisResult(result);

        // Handle different response structures based on mode
        if (result.mode === 'stations' && result.stations) {
          // Stations mode - just return stations
          setAvailableStations(result.stations || []);
          emit('trigger-event', {
            name: 'stations-found',
            event: {
              stations: result.stations,
              totalFound: result.stations.length,
            },
          });
        } else if (result.result) {
          // Full calculation result
          const data = result.result;

          setCalculatedZone(data.zone || '');
          setMinTemperature(data.minTemp || null);

          if (data.autoSelectedStation || data.selectedStation) {
            setSelectedStation(data.autoSelectedStation || data.selectedStation);
          }

          if (data.growingSeason) {
            setFrostDates(data.growingSeason);
            if (data.growingSeason.calendarEvents) {
              setCalendarEvents(data.growingSeason.calendarEvents);
            }
          }

          if (data.moistureZone) {
            setMoistureZone(data.moistureZone);
          }

          if (data.extremeWeatherEvents) {
            setExtremeWeather(data.extremeWeatherEvents);
          }

          // If stations are available in result
          if (result.stations) {
            setAvailableStations(result.stations);
          }

          emit('trigger-event', {
            name: 'zone-calculated',
            event: {
              zone: data.zone,
              minTemp: data.minTemp,
              mode: result.mode,
              location: { lat, lng },
            },
          });
        }

        setStatus('success');
        setIsLoading(false);
      } catch (error) {
        console.error('Hardiness calculation error:', error);

        setStatus('error');
        setIsLoading(false);
        setErrorMessage(error.message || 'Unknown error occurred');

        // Extract suggestions if available
        if (error.suggestions) {
          setErrorSuggestions(error.suggestions);
        }

        emit('trigger-event', {
          name: 'calculation-error',
          event: {
            error: error.message,
            suggestions: error.suggestions || [],
          },
        });
      }
    }

    // ========================================
    // ACTION HANDLERS
    // ========================================

    async function handleRequestGeolocation() {
      if (!navigator.geolocation) {
        setErrorMessage('Geolocation is not supported by your browser');
        emit('trigger-event', {
          name: 'geolocation-denied',
          event: { message: 'Geolocation not supported' },
        });
        return;
      }

      setStatus('loading');
      setIsLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setCurrentLocation({ lat, lng });

          emit('trigger-event', {
            name: 'location-selected',
            event: { lat, lng, source: 'geolocation' },
          });

          await calculateHardiness(lat, lng);
        },
        (error) => {
          setStatus('error');
          setIsLoading(false);

          let message = 'Geolocation access denied';
          if (error.code === 1) message = 'User denied geolocation permission';
          if (error.code === 2) message = 'Location information unavailable';
          if (error.code === 3) message = 'Geolocation request timeout';

          setErrorMessage(message);

          emit('trigger-event', {
            name: 'geolocation-denied',
            event: { message },
          });
        }
      );
    }

    async function handleCalculateForLocation(lat, lng) {
      if (!lat || !lng) {
        setErrorMessage('Invalid coordinates provided');
        return;
      }

      setCurrentLocation({ lat, lng });

      emit('trigger-event', {
        name: 'location-selected',
        event: { lat, lng, source: 'manual' },
      });

      await calculateHardiness(lat, lng);
    }

    async function handleSelectStation(stationId) {
      if (!stationId) {
        setErrorMessage('No station ID provided');
        return;
      }

      const loc = currentLocation.value;
      if (!loc?.lat || !loc?.lng) {
        setErrorMessage('Please select a location first');
        return;
      }

      setIsLoading(true);
      setStatus('loading');

      try {
        const payload = {
          lat: loc.lat,
          lng: loc.lng,
          mode: 'noaa',
          stationId: stationId,
          years: analysisYears.value,
          radius: searchRadius.value,
        };

        if (props.content?.userElevation !== null && props.content?.userElevation !== undefined) {
          payload.elevation = props.content?.userElevation;
        }

        if (microclimateFactors.value) {
          payload.microclimate = microclimateFactors.value;
        }

        const result = await callEdgeFunction('hardiness-zone-hybrid', payload);

        if (result.result) {
          const data = result.result;

          setCalculatedZone(data.zone || '');
          setMinTemperature(data.minTemp || null);

          // Find and set selected station
          const station = availableStations.value?.find(s => s.id === stationId);
          if (station) {
            setSelectedStation(station);
            emit('trigger-event', {
              name: 'station-selected',
              event: {
                stationId: station.id,
                name: station.name,
                distance: station.distance,
                quality: station.quality,
              },
            });
          }

          if (data.growingSeason) {
            setFrostDates(data.growingSeason);
            if (data.growingSeason.calendarEvents) {
              setCalendarEvents(data.growingSeason.calendarEvents);
            }
          }

          if (data.moistureZone) {
            setMoistureZone(data.moistureZone);
          }

          emit('trigger-event', {
            name: 'zone-calculated',
            event: {
              zone: data.zone,
              minTemp: data.minTemp,
              mode: 'noaa',
              location: loc,
            },
          });
        }

        setStatus('success');
        setIsLoading(false);
      } catch (error) {
        setStatus('error');
        setIsLoading(false);
        setErrorMessage(error.message);

        emit('trigger-event', {
          name: 'calculation-error',
          event: { error: error.message, suggestions: [] },
        });
      }
    }

    function handleClearResults() {
      setCurrentLocation({ lat: null, lng: null });
      setCalculatedZone('');
      setMinTemperature(null);
      setAvailableStations([]);
      setSelectedStation(null);
      setFrostDates(null);
      setCalendarEvents([]);
      setMoistureZone(null);
      setExtremeWeather([]);
      setAnalysisResult(null);
      setStatus('idle');
      setIsLoading(false);
      setErrorMessage('');
      setErrorSuggestions([]);
    }

    // Test function for editor preview
    function handleTestLocation() {
      // Warsaw coordinates
      handleCalculateForLocation(52.19, 21.00);
    }

    // ========================================
    // WATCHERS
    // ========================================

    // Watch for input location changes from map component
    watch(
      () => [inputLatitude.value, inputLongitude.value],
      ([lat, lng], [oldLat, oldLng]) => {
        // Only trigger if location actually changed and both values exist
        if (!lat || !lng) return;
        if (lat === oldLat && lng === oldLng) return;

        // Validate coordinates
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.warn('Invalid coordinates received from map:', lat, lng);
          return;
        }

        console.log('Location received from map:', lat, lng);

        // Auto-calculate if enabled
        if (autoCalculateOnLocationChange.value) {
          handleCalculateForLocation(lat, lng);
        } else {
          // Just update the location without calculating
          setCurrentLocation({ lat, lng });
          emit('trigger-event', {
            name: 'location-selected',
            event: { lat, lng, source: 'map' },
          });
        }
      },
      { immediate: false }
    );

    // Watch ALL properties that affect component behavior for real-time updates
    watch(
      () => [
        props.content?.supabaseUrl,
        props.content?.supabaseAnonKey,
        props.content?.calculationMode,
        props.content?.searchRadius,
        props.content?.stationLimit,
        props.content?.analysisYears,
        props.content?.userElevation,
        props.content?.enableMicroclimate,
        props.content?.nearWater,
        props.content?.urbanArea,
        props.content?.windExposed,
        props.content?.southFacing,
        props.content?.autoCalculateOnLocationChange,
        props.content?.autoCalculateOnLoad,
        props.content?.temperatureUnit,
        props.content?.distanceUnit,
      ],
      () => {
        // Configuration changed - clear error state
        if (errorMessage.value) {
          setErrorMessage('');
          setErrorSuggestions([]);
        }

        // If we have a current location and auto-calculate is on, recalculate
        // (but not for unit changes - those are handled by separate watchers)
        if (
          currentLocation.value?.lat &&
          currentLocation.value?.lng &&
          autoCalculateOnLocationChange.value &&
          status.value === 'success'
        ) {
          // Recalculate with new settings after a small delay
          setTimeout(() => {
            console.log('Recalculating due to property change');
            calculateHardiness(currentLocation.value.lat, currentLocation.value.lng);
          }, 100);
        }
      },
      { deep: true }
    );

    // ========================================
    // WEWEB ACTIONS REGISTRATION
    // ========================================

    // Register actions to be callable from WeWeb workflows
    wwLib.wwAction.registerActions(props.uid, [
      {
        name: 'requestGeolocation',
        label: 'Request Geolocation',
        fn: handleRequestGeolocation,
      },
      {
        name: 'calculateForLocation',
        label: 'Calculate for Location',
        fn: ({ lat, lng }) => handleCalculateForLocation(lat, lng),
      },
      {
        name: 'selectStation',
        label: 'Select Station',
        fn: ({ stationId }) => handleSelectStation(stationId),
      },
      {
        name: 'clearResults',
        label: 'Clear Results',
        fn: handleClearResults,
      },
    ]);

    // ========================================
    // LIFECYCLE
    // ========================================

    onMounted(() => {
      console.log('USDA Hardiness Zone Finder mounted');

      // Auto-calculate if enabled
      if (props.content?.autoCalculateOnLoad) {
        handleRequestGeolocation();
      }
    });

    onBeforeUnmount(() => {
      console.log('USDA Hardiness Zone Finder unmounted');

      // Unregister actions on unmount
      wwLib.wwAction.unregisterActions(props.uid);
    });

    return {
      /* wwEditor:start */
      isEditing,
      /* wwEditor:end */

      // State
      currentLocation,
      calculatedZone,
      minTemperature,
      minTemperatureConverted,
      temperatureUnitLabel,
      availableStations,
      availableStationsConverted,
      distanceUnitLabel,
      selectedStation,
      frostDates,
      calendarEvents,
      moistureZone,
      status,
      isLoading,
      errorMessage,
      errorSuggestions,
      statusClass,

      // Actions (for editor preview buttons)
      handleRequestGeolocation,
      handleCalculateForLocation,
      handleSelectStation,
      handleClearResults,
      handleTestLocation,
    };
  },
};
</script>

<style lang="scss" scoped>
.usda-hz-finder {
  /* Component has no visible UI by default */
  /* All data exposed via internal variables */
}

/* wwEditor:start */
.editor-preview {
  padding: 20px;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  font-family: system-ui, -apple-system, sans-serif;

  .preview-header {
    margin-bottom: 20px;

    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }

    .preview-note {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }
  }

  .preview-status {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;
    padding: 12px;
    background: white;
    border-radius: 6px;
    border: 1px solid #e5e7eb;

    .status-item {
      display: flex;
      gap: 8px;
      align-items: center;

      .label {
        font-weight: 500;
        color: #6b7280;
        font-size: 14px;
      }

      .value {
        font-weight: 600;
        color: #111827;
        font-size: 14px;

        &.status-idle { color: #6b7280; }
        &.status-loading { color: #3b82f6; }
        &.status-success { color: #22c55e; }
        &.status-error { color: #ef4444; }

        &.zone-badge {
          padding: 2px 8px;
          background: #22c55e;
          color: white;
          border-radius: 4px;
          font-size: 13px;
        }
      }
    }
  }

  .preview-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;

    .action-btn {
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: #2563eb;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .preview-data {
    margin-bottom: 16px;
    padding: 12px;
    background: white;
    border-radius: 6px;
    border: 1px solid #e5e7eb;

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #111827;
    }

    .station-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .station-item {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        background: #f9fafb;
        border-radius: 4px;
        font-size: 13px;

        .station-name {
          flex: 1;
          font-weight: 500;
        }

        .station-distance {
          color: #6b7280;
          margin: 0 12px;
        }

        .station-quality {
          font-weight: 600;
          text-transform: capitalize;
        }
      }
    }
  }

  .preview-error {
    padding: 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #991b1b;
    font-size: 14px;
    margin-bottom: 16px;

    strong {
      display: block;
      margin-bottom: 4px;
    }

    .error-suggestions {
      margin-top: 8px;

      ul {
        margin: 4px 0 0 0;
        padding-left: 20px;

        li {
          margin: 2px 0;
          font-size: 13px;
        }
      }
    }
  }

  .preview-info {
    padding: 12px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    font-size: 13px;

    p {
      margin: 0 0 8px 0;
      font-weight: 600;
      color: #1e40af;
    }

    ul {
      margin: 0;
      padding-left: 20px;
      color: #1e3a8a;

      li {
        margin: 2px 0;
        font-family: 'Courier New', monospace;
      }
    }
  }
}
/* wwEditor:end */
</style>
