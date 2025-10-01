<template>
  <div class="hz-dashboard" :class="dashboardClasses" :style="dashboardStyle">
    <!-- Loading State with Progress -->
    <div v-if="isLoading" class="loading-overlay" :class="{ 'animate': animationsEnabled }">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h3 class="loading-title">{{ loadingMessage }}</h3>
        <div v-if="progressDetails" class="progress-details">
          <div v-for="(detail, idx) in progressDetails" :key="idx" class="progress-item">
            <span class="progress-icon">{{ detail.icon }}</span>
            <span class="progress-text">{{ detail.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="hasError && !isLoading" class="error-container" :class="{ 'animate': animationsEnabled }">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">Unable to Load Data</h3>
      <p class="error-message">{{ errorMessage || 'An error occurred while loading hardiness zone data.' }}</p>
      <div v-if="errorSuggestions?.length > 0" class="error-suggestions">
        <strong>Suggestions:</strong>
        <ul>
          <li v-for="(suggestion, idx) in errorSuggestions" :key="idx">{{ suggestion }}</li>
        </ul>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div v-if="!isLoading && !hasError" class="dashboard-content" :class="{ 'compact': compactMode, 'animate': animationsEnabled }">
      
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-main">
          <h1 class="dashboard-title">
            <span class="title-icon">🌱</span>
            USDA Hardiness Zone Dashboard
          </h1>
          <p v-if="hasData" class="dashboard-subtitle">
            Comprehensive climate analysis for your location
          </p>
        </div>
        <div v-if="statusIndicator" class="status-badge" :class="`status-${status}`">
          <span class="status-dot"></span>
          {{ statusIndicator }}
        </div>
      </div>

      <!-- No Data State -->
      <div v-if="!hasData" class="no-data-container">
        <div class="no-data-icon">📍</div>
        <h3 class="no-data-title">No Location Selected</h3>
        <p class="no-data-text">Select a location on the map or use geolocation to view hardiness zone data.</p>
      </div>

      <!-- Dashboard Grid -->
      <div v-if="hasData" class="dashboard-grid">
        
        <!-- Zone Summary Card (Hero) -->
        <div v-if="showZoneCard && calculatedZone" class="card card-hero zone-card">
          <div class="card-header">
            <h2 class="card-title">
              <span class="card-icon">🌡️</span>
              Your Hardiness Zone
            </h2>
          </div>
          <div class="card-body">
            <div class="zone-display">
              <div class="zone-number">{{ calculatedZone }}</div>
              <div class="zone-temp">
                <span class="temp-value">{{ minTemperatureConverted }}</span>
                <span class="temp-unit">{{ temperatureUnitLabel }}</span>
              </div>
            </div>
            <div class="zone-description">
              <p>{{ getZoneDescription(calculatedZone) }}</p>
            </div>
            <div v-if="selectedStation" class="zone-source">
              <span class="source-label">Data from:</span>
              <span class="source-value">{{ selectedStation.name }}</span>
              <span v-if="selectedStation.distance" class="source-distance">
                ({{ selectedStation.distance }} {{ distanceUnitLabel }})
              </span>
            </div>
          </div>
        </div>

        <!-- Location Card -->
        <div v-if="showLocationCard && currentLocation?.lat" class="card location-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="card-icon">📍</span>
              Location
            </h3>
          </div>
          <div class="card-body">
            <div class="location-coords">
              <div class="coord-item">
                <span class="coord-label">Latitude</span>
                <span class="coord-value">{{ formatCoordinate(currentLocation.lat) }}°</span>
              </div>
              <div class="coord-item">
                <span class="coord-label">Longitude</span>
                <span class="coord-value">{{ formatCoordinate(currentLocation.lng) }}°</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Frost Dates Card -->
        <div v-if="showFrostDatesCard && frostDates" class="card frost-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="card-icon">❄️</span>
              Frost Dates
            </h3>
          </div>
          <div class="card-body">
            <div class="frost-dates">
              <div v-if="frostDates.lastSpringFrost" class="frost-item spring">
                <span class="frost-label">Last Spring Frost</span>
                <span class="frost-value">{{ formatDate(frostDates.lastSpringFrost) }}</span>
              </div>
              <div v-if="frostDates.firstFallFrost" class="frost-item fall">
                <span class="frost-label">First Fall Frost</span>
                <span class="frost-value">{{ formatDate(frostDates.firstFallFrost) }}</span>
              </div>
              <div v-if="growingSeasonLength" class="frost-item season">
                <span class="frost-label">Growing Season</span>
                <span class="frost-value">{{ growingSeasonLength }} days</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Weather Stations Card -->
        <div v-if="showStationsCard && availableStationsConverted?.length > 0" class="card stations-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="card-icon">📡</span>
              Weather Stations
              <span class="station-count">{{ availableStationsConverted.length }}</span>
            </h3>
          </div>
          <div class="card-body">
            <div class="stations-list">
              <div 
                v-for="(station, idx) in displayedStations" 
                :key="station.id"
                class="station-item"
                :class="{ 'selected': selectedStation?.id === station.id }"
                @click="handleStationClick(station)"
              >
                <div class="station-rank">{{ idx + 1 }}</div>
                <div class="station-info">
                  <div class="station-name">{{ station.name }}</div>
                  <div class="station-meta">
                    <span class="station-distance">{{ station.distance }} {{ distanceUnitLabel }}</span>
                    <span v-if="station.quality" class="station-quality" :style="{ color: station.quality.color }">
                      {{ station.quality.level }}
                    </span>
                  </div>
                </div>
                <div v-if="station.quality" class="station-score">
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: `${station.quality.score}%`, backgroundColor: station.quality.color }"></div>
                  </div>
                </div>
              </div>
            </div>
            <button v-if="hasMoreStations" @click="showAllStations = !showAllStations" class="btn-show-more">
              {{ showAllStations ? 'Show Less' : `Show ${remainingStationsCount} More` }}
            </button>
          </div>
        </div>

        <!-- Moisture Zone Card -->
        <div v-if="showMoistureCard && moistureZone" class="card moisture-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="card-icon">💧</span>
              Moisture Zone
            </h3>
          </div>
          <div class="card-body">
            <div class="moisture-info">
              <div v-if="moistureZone.zone" class="moisture-zone">
                <span class="moisture-label">Zone</span>
                <span class="moisture-value">{{ moistureZone.zone }}</span>
              </div>
              <div v-if="moistureZone.avgAnnualPrecip" class="moisture-precip">
                <span class="moisture-label">Annual Precipitation</span>
                <span class="moisture-value">{{ moistureZone.avgAnnualPrecip }} inches</span>
              </div>
              <div v-if="moistureZone.description" class="moisture-description">
                {{ moistureZone.description }}
              </div>
            </div>
          </div>
        </div>

        <!-- Calendar Events Card -->
        <div v-if="showCalendarCard && calendarEvents?.length > 0" class="card calendar-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="card-icon">📅</span>
              Planting Calendar
            </h3>
          </div>
          <div class="card-body">
            <div class="calendar-timeline">
              <div v-for="(event, idx) in calendarEvents" :key="idx" class="calendar-event">
                <div class="event-date">{{ formatDate(event.date) }}</div>
                <div class="event-content">
                  <div class="event-title">{{ event.title }}</div>
                  <div v-if="event.description" class="event-description">{{ event.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Extreme Weather Card -->
        <div v-if="showExtremeWeatherCard && extremeWeather?.length > 0" class="card extreme-weather-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="card-icon">⚡</span>
              Extreme Weather Events
            </h3>
          </div>
          <div class="card-body">
            <div class="extreme-events-list">
              <div v-for="(event, idx) in extremeWeather" :key="idx" class="extreme-event">
                <div class="event-severity" :class="`severity-${event.severity}`">
                  <span class="severity-icon">{{ getSeverityIcon(event.severity) }}</span>
                </div>
                <div class="event-details">
                  <div class="event-type">{{ event.type }}</div>
                  <div v-if="event.date" class="event-date">{{ formatDate(event.date) }}</div>
                  <div v-if="event.value" class="event-value">{{ event.value }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Raw Data Card (Developer Debug) -->
        <!-- wwEditor:start -->
        <div v-if="isEditing && analysisResult" class="card debug-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="card-icon">🔧</span>
              Raw Analysis Data
            </h3>
          </div>
          <div class="card-body">
            <pre class="debug-data">{{ JSON.stringify(analysisResult, null, 2) }}</pre>
          </div>
        </div>
        <!-- wwEditor:end -->

      </div>
    </div>
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
    const { ref, computed, watch } = window.Vue;

    /* wwEditor:start */
    const isEditing = computed(() => props.wwEditorState?.isEditing || false);
    /* wwEditor:end */

    // ========================================
    // DATA PROPERTIES
    // ========================================

    const currentLocation = computed(() => props.content?.currentLocation);
    const calculatedZone = computed(() => props.content?.calculatedZone);
    const minTemperature = computed(() => props.content?.minTemperature);
    const minTemperatureConverted = computed(() => props.content?.minTemperatureConverted);
    const temperatureUnitLabel = computed(() => props.content?.temperatureUnitLabel || '°F');
    const availableStations = computed(() => props.content?.availableStations || []);
    const availableStationsConverted = computed(() => props.content?.availableStationsConverted || []);
    const distanceUnitLabel = computed(() => props.content?.distanceUnitLabel || 'km');
    const selectedStation = computed(() => props.content?.selectedStation);
    const frostDates = computed(() => props.content?.frostDates);
    const calendarEvents = computed(() => props.content?.calendarEvents || []);
    const moistureZone = computed(() => props.content?.moistureZone);
    const extremeWeather = computed(() => props.content?.extremeWeather || []);
    const analysisResult = computed(() => props.content?.analysisResult);
    const status = computed(() => props.content?.status || 'idle');
    const isLoading = computed(() => props.content?.isLoading || false);
    const errorMessage = computed(() => props.content?.errorMessage);
    const errorSuggestions = computed(() => props.content?.errorSuggestions || []);

    // ========================================
    // DISPLAY SETTINGS
    // ========================================

    const theme = computed(() => props.content?.theme || 'light');
    const accentColor = computed(() => props.content?.accentColor || '#22c55e');
    const backgroundColor = computed(() => props.content?.backgroundColor || '#ffffff');
    const cardBackgroundColor = computed(() => props.content?.cardBackgroundColor || '#f9fafb');
    const textColor = computed(() => props.content?.textColor || '#111827');
    const borderRadius = computed(() => props.content?.borderRadius || '12px');

    const showLocationCard = computed(() => props.content?.showLocationCard ?? true);
    const showZoneCard = computed(() => props.content?.showZoneCard ?? true);
    const showStationsCard = computed(() => props.content?.showStationsCard ?? true);
    const showFrostDatesCard = computed(() => props.content?.showFrostDatesCard ?? true);
    const showMoistureCard = computed(() => props.content?.showMoistureCard ?? true);
    const showCalendarCard = computed(() => props.content?.showCalendarCard ?? true);
    const showExtremeWeatherCard = computed(() => props.content?.showExtremeWeatherCard ?? true);

    const compactMode = computed(() => props.content?.compactMode || false);
    const animationsEnabled = computed(() => props.content?.animationsEnabled ?? true);

    // ========================================
    // COMPUTED STATE
    // ========================================

    const hasError = computed(() => status.value === 'error' || !!errorMessage.value);
    const hasData = computed(() => {
      return !!(calculatedZone.value || availableStationsConverted.value?.length > 0);
    });

    const statusIndicator = computed(() => {
      const s = status.value;
      if (s === 'loading') return 'Loading...';
      if (s === 'success') return 'Up to date';
      if (s === 'error') return 'Error';
      return null;
    });

    const loadingMessage = computed(() => {
      if (!analysisResult.value) return 'Initializing...';
      if (analysisResult.value.mode === 'stations') return 'Finding weather stations...';
      return 'Calculating hardiness zone...';
    });

    const progressDetails = computed(() => {
      if (!isLoading.value) return null;
      
      const details = [
        { icon: '📍', text: 'Locating position...' }
      ];

      if (analysisResult.value?.mode) {
        details.push({ icon: '📡', text: 'Searching weather stations...' });
      }

      if (availableStations.value?.length > 0) {
        details.push({ 
          icon: '✓', 
          text: `Found ${availableStations.value.length} stations` 
        });
      }

      return details;
    });

    const growingSeasonLength = computed(() => {
      if (!frostDates.value?.lastSpringFrost || !frostDates.value?.firstFallFrost) return null;
      const spring = new Date(frostDates.value.lastSpringFrost);
      const fall = new Date(frostDates.value.firstFallFrost);
      const diffTime = Math.abs(fall - spring);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    });

    // Station display logic
    const showAllStations = ref(false);
    const maxStationsDisplay = computed(() => compactMode.value ? 3 : 5);
    const displayedStations = computed(() => {
      const stations = availableStationsConverted.value || [];
      if (showAllStations.value) return stations;
      return stations.slice(0, maxStationsDisplay.value);
    });
    const hasMoreStations = computed(() => {
      return availableStationsConverted.value?.length > maxStationsDisplay.value;
    });
    const remainingStationsCount = computed(() => {
      return availableStationsConverted.value?.length - maxStationsDisplay.value;
    });

    // ========================================
    // STYLING
    // ========================================

    const dashboardClasses = computed(() => {
      return {
        [`theme-${theme.value}`]: true,
        'compact': compactMode.value,
        'has-data': hasData.value,
        'is-loading': isLoading.value,
        'has-error': hasError.value,
      };
    });

    const dashboardStyle = computed(() => ({
      '--accent-color': accentColor.value,
      '--bg-color': backgroundColor.value,
      '--card-bg-color': cardBackgroundColor.value,
      '--text-color': textColor.value,
      '--border-radius': borderRadius.value,
    }));

    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    function formatCoordinate(coord) {
      if (!coord) return '—';
      return Number(coord).toFixed(4);
    }

    function formatDate(dateStr) {
      if (!dateStr) return '—';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    }

    function getZoneDescription(zone) {
      const descriptions = {
        '1a': 'Extremely cold - Minimum temps below -60°F',
        '1b': 'Extremely cold - Minimum temps -55°F to -60°F',
        '2a': 'Very cold - Minimum temps -45°F to -50°F',
        '2b': 'Very cold - Minimum temps -40°F to -45°F',
        '3a': 'Cold - Minimum temps -35°F to -40°F',
        '3b': 'Cold - Minimum temps -30°F to -35°F',
        '4a': 'Moderate cold - Minimum temps -25°F to -30°F',
        '4b': 'Moderate cold - Minimum temps -20°F to -25°F',
        '5a': 'Cool - Minimum temps -15°F to -20°F',
        '5b': 'Cool - Minimum temps -10°F to -15°F',
        '6a': 'Mild cold - Minimum temps -5°F to -10°F',
        '6b': 'Mild cold - Minimum temps 0°F to -5°F',
        '7a': 'Mild - Minimum temps 0°F to 5°F',
        '7b': 'Mild - Minimum temps 5°F to 10°F',
        '8a': 'Warm - Minimum temps 10°F to 15°F',
        '8b': 'Warm - Minimum temps 15°F to 20°F',
        '9a': 'Hot - Minimum temps 20°F to 25°F',
        '9b': 'Hot - Minimum temps 25°F to 30°F',
        '10a': 'Very hot - Minimum temps 30°F to 35°F',
        '10b': 'Very hot - Minimum temps 35°F to 40°F',
        '11a': 'Tropical - Minimum temps 40°F to 45°F',
        '11b': 'Tropical - Minimum temps 45°F to 50°F',
        '12a': 'Very tropical - Minimum temps 50°F to 55°F',
        '12b': 'Very tropical - Minimum temps 55°F to 60°F',
        '13a': 'Extremely hot - Minimum temps 60°F to 65°F',
        '13b': 'Extremely hot - Minimum temps above 65°F',
      };
      return descriptions[zone] || 'Climate zone information';
    }

    function getSeverityIcon(severity) {
      if (severity === 'high') return '🔴';
      if (severity === 'medium') return '🟡';
      return '🟢';
    }

    function handleStationClick(station) {
      emit('trigger-event', {
        name: 'station-clicked',
        event: {
          stationId: station.id,
          station: station,
        },
      });
    }

    // ========================================
    // RETURN
    // ========================================

    return {
      /* wwEditor:start */
      isEditing,
      /* wwEditor:end */

      // Data
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
      extremeWeather,
      analysisResult,
      status,
      isLoading,
      errorMessage,
      errorSuggestions,

      // Display settings
      theme,
      showLocationCard,
      showZoneCard,
      showStationsCard,
      showFrostDatesCard,
      showMoistureCard,
      showCalendarCard,
      showExtremeWeatherCard,
      compactMode,
      animationsEnabled,

      // Computed
      hasError,
      hasData,
      statusIndicator,
      loadingMessage,
      progressDetails,
      growingSeasonLength,
      dashboardClasses,
      dashboardStyle,

      // Station display
      showAllStations,
      displayedStations,
      hasMoreStations,
      remainingStationsCount,

      // Helpers
      formatCoordinate,
      formatDate,
      getZoneDescription,
      getSeverityIcon,
      handleStationClick,
    };
  },
};
</script>

<style lang="scss" scoped>
.hz-dashboard {
  --accent-color: #22c55e;
  --bg-color: #ffffff;
  --card-bg-color: #f9fafb;
  --text-color: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --border-radius: 12px;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  position: relative;
  width: 100%;
  min-height: 400px;
  padding: 24px;
  background: var(--bg-color);
  color: var(--text-color);
  font-family: system-ui, -apple-system, sans-serif;
  transition: all 0.3s ease;

  &.compact {
    padding: 16px;
  }

  &.theme-dark {
    --bg-color: #111827;
    --card-bg-color: #1f2937;
    --text-color: #f9fafb;
    --text-secondary: #9ca3af;
    --border-color: #374151;
  }

  // ========================================
  // LOADING OVERLAY
  // ========================================

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;

    .theme-dark & {
      background: rgba(17, 24, 39, 0.95);
    }

    &.animate {
      animation: fadeIn 0.3s ease;
    }
  }

  .loading-content {
    text-align: center;
    max-width: 400px;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
    margin: 0 auto 24px;
    border: 4px solid var(--border-color);
    border-top-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-title {
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-color);
  }

  .progress-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
  }

  .progress-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--card-bg-color);
    border-radius: 8px;
    text-align: left;
    animation: slideIn 0.3s ease;

    .progress-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .progress-text {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }

  // ========================================
  // ERROR STATE
  // ========================================

  .error-container {
    padding: 40px;
    text-align: center;
    background: var(--card-bg-color);
    border-radius: var(--border-radius);
    border: 2px solid #fecaca;

    &.animate {
      animation: fadeIn 0.3s ease;
    }
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .error-title {
    margin: 0 0 12px 0;
    font-size: 20px;
    font-weight: 600;
    color: #dc2626;
  }

  .error-message {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: var(--text-secondary);
  }

  .error-suggestions {
    margin-top: 20px;
    padding: 16px;
    background: rgba(220, 38, 38, 0.05);
    border-radius: 8px;
    text-align: left;

    strong {
      display: block;
      margin-bottom: 8px;
      color: #dc2626;
    }

    ul {
      margin: 0;
      padding-left: 20px;

      li {
        margin: 4px 0;
        color: var(--text-secondary);
        font-size: 14px;
      }
    }
  }

  // ========================================
  // DASHBOARD CONTENT
  // ========================================

  .dashboard-content {
    &.animate {
      animation: fadeIn 0.5s ease;
    }
  }

  // ========================================
  // HEADER
  // ========================================

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid var(--border-color);

    .compact & {
      margin-bottom: 20px;
      padding-bottom: 16px;
    }
  }

  .header-main {
    flex: 1;
  }

  .dashboard-title {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: 700;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 12px;

    .compact & {
      font-size: 24px;
    }

    .title-icon {
      font-size: 36px;

      .compact & {
        font-size: 28px;
      }
    }
  }

  .dashboard-subtitle {
    margin: 0;
    font-size: 16px;
    color: var(--text-secondary);
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--card-bg-color);
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid var(--border-color);

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--text-secondary);
    }

    &.status-loading .status-dot {
      background: #3b82f6;
      animation: pulse 2s ease infinite;
    }

    &.status-success .status-dot {
      background: var(--accent-color);
    }

    &.status-error .status-dot {
      background: #dc2626;
    }
  }

  // ========================================
  // NO DATA STATE
  // ========================================

  .no-data-container {
    padding: 60px 40px;
    text-align: center;
    background: var(--card-bg-color);
    border-radius: var(--border-radius);
    border: 2px dashed var(--border-color);
  }

  .no-data-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.6;
  }

  .no-data-title {
    margin: 0 0 12px 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-color);
  }

  .no-data-text {
    margin: 0;
    font-size: 16px;
    color: var(--text-secondary);
    max-width: 500px;
    margin: 0 auto;
  }

  // ========================================
  // DASHBOARD GRID
  // ========================================

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;

    .compact & {
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  // ========================================
  // CARDS
  // ========================================

  .card {
    background: var(--card-bg-color);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: all 0.3s ease;

    .animate & {
      animation: slideUp 0.4s ease;
    }

    &:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    &.card-hero {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, var(--accent-color) 0%, #16a34a 100%);
      color: white;
      border: none;
      box-shadow: var(--shadow-lg);

      .card-title,
      .zone-number,
      .zone-temp,
      .zone-description p,
      .source-label,
      .source-value,
      .source-distance {
        color: white;
      }
    }
  }

  .card-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);

    .compact & {
      padding: 16px;
    }

    .card-hero & {
      border-bottom-color: rgba(255, 255, 255, 0.2);
    }
  }

  .card-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 8px;

    .compact & {
      font-size: 16px;
    }

    .card-icon {
      font-size: 20px;
    }
  }

  .station-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    margin-left: 8px;
    background: var(--accent-color);
    color: white;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .card-body {
    padding: 20px;

    .compact & {
      padding: 16px;
    }
  }

  // ========================================
  // ZONE CARD
  // ========================================

  .zone-display {
    display: flex;
    align-items: baseline;
    gap: 20px;
    margin-bottom: 24px;
  }

  .zone-number {
    font-size: 72px;
    font-weight: 800;
    line-height: 1;
    color: var(--accent-color);

    .compact & {
      font-size: 56px;
    }
  }

  .zone-temp {
    display: flex;
    align-items: baseline;
    gap: 4px;

    .temp-value {
      font-size: 36px;
      font-weight: 600;
      color: var(--text-color);
    }

    .temp-unit {
      font-size: 20px;
      font-weight: 500;
      color: var(--text-secondary);
    }
  }

  .zone-description {
    margin-bottom: 20px;

    p {
      margin: 0;
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-secondary);
      opacity: 0.9;
    }
  }

  .zone-source {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    opacity: 0.8;

    .source-label {
      font-weight: 500;
    }

    .source-value {
      font-weight: 600;
    }

    .source-distance {
      opacity: 0.7;
    }
  }

  // ========================================
  // LOCATION CARD
  // ========================================

  .location-coords {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .coord-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .coord-label {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
    }

    .coord-value {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-color);
      font-family: 'Courier New', monospace;
    }
  }

  // ========================================
  // FROST DATES CARD
  // ========================================

  .frost-dates {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .frost-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: var(--bg-color);
    border-radius: 8px;
    border-left: 4px solid var(--accent-color);

    &.spring {
      border-left-color: #3b82f6;
    }

    &.fall {
      border-left-color: #f59e0b;
    }

    &.season {
      border-left-color: var(--accent-color);
    }

    .frost-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .frost-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-color);
    }
  }

  // ========================================
  // STATIONS CARD
  // ========================================

  .stations-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .station-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--bg-color);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--accent-color);
      color: white;
      transform: translateX(4px);

      .station-name,
      .station-meta,
      .station-distance,
      .station-quality {
        color: white;
      }
    }

    &.selected {
      border-color: var(--accent-color);
      background: rgba(34, 197, 94, 0.05);
    }
  }

  .station-rank {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--accent-color);
    color: white;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .station-info {
    flex: 1;
    min-width: 0;

    .station-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .station-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .station-distance {
      font-weight: 500;
    }

    .station-quality {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
    }
  }

  .station-score {
    width: 60px;
    flex-shrink: 0;

    .score-bar {
      height: 6px;
      background: var(--border-color);
      border-radius: 3px;
      overflow: hidden;

      .score-fill {
        height: 100%;
        transition: width 0.3s ease;
      }
    }
  }

  .btn-show-more {
    margin-top: 12px;
    width: 100%;
    padding: 10px;
    background: var(--bg-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
    }
  }

  // ========================================
  // MOISTURE CARD
  // ========================================

  .moisture-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .moisture-zone,
  .moisture-precip {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: var(--bg-color);
    border-radius: 8px;

    .moisture-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .moisture-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-color);
    }
  }

  .moisture-description {
    padding: 12px;
    background: rgba(59, 130, 246, 0.05);
    border-left: 4px solid #3b82f6;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  // ========================================
  // CALENDAR CARD
  // ========================================

  .calendar-timeline {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .calendar-event {
    display: flex;
    gap: 16px;
    padding: 12px;
    background: var(--bg-color);
    border-radius: 8px;
    border-left: 4px solid var(--accent-color);

    .event-date {
      flex-shrink: 0;
      padding: 8px 12px;
      background: var(--accent-color);
      color: white;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }

    .event-content {
      flex: 1;

      .event-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 4px;
      }

      .event-description {
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.5;
      }
    }
  }

  // ========================================
  // EXTREME WEATHER CARD
  // ========================================

  .extreme-events-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .extreme-event {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: var(--bg-color);
    border-radius: 8px;
    align-items: flex-start;

    .event-severity {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--card-bg-color);
      border: 2px solid var(--border-color);

      &.severity-high {
        border-color: #dc2626;
        background: rgba(220, 38, 38, 0.1);
      }

      &.severity-medium {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
      }

      &.severity-low {
        border-color: var(--accent-color);
        background: rgba(34, 197, 94, 0.1);
      }

      .severity-icon {
        font-size: 20px;
      }
    }

    .event-details {
      flex: 1;

      .event-type {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 4px;
      }

      .event-date {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 2px;
      }

      .event-value {
        font-size: 13px;
        color: var(--text-secondary);
      }
    }
  }

  // ========================================
  // DEBUG CARD
  // ========================================

  .debug-card {
    grid-column: 1 / -1;
    background: #1f2937;
    border-color: #374151;

    .card-title {
      color: #f9fafb;
    }

    .debug-data {
      margin: 0;
      padding: 16px;
      background: #111827;
      border-radius: 8px;
      color: #10b981;
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
      max-height: 400px;
    }
  }

  // ========================================
  // ANIMATIONS
  // ========================================

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
}
</style>
