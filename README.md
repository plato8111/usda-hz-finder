# USDA Hardiness Zone Finder - WeWeb Component

A professional **data provider component** for calculating USDA Plant Hardiness Zones using real historical climate data from NOAA and WeatherAPI.

## 🌟 Features

- **Real Historical Data**: Uses 30+ years of NOAA weather station data
- **Multiple Calculation Modes**: Auto, NOAA, WeatherAPI, Compare, Stations
- **Frost Date Analysis**: Real last spring frost and first fall frost dates from historical data
- **Station Quality Indicators**: Color-coded station quality (excellent/good/fair/poor)
- **Growing Season Calendar**: Planting and harvest calendar events
- **Microclimate Adjustments**: Elevation, urban heat island, water proximity effects
- **Moisture Zone Analysis**: Precipitation patterns and irrigation recommendations
- **Data Provider Pattern**: No UI - exposes all data via internal variables
- **Map Integration Ready**: Designed to work with any map component

## 📦 Installation

### 1. Install Dependencies

```bash
cd usda-hz-finder
npm install
```

### 2. Configure Supabase

In your WeWeb project, you need:
- **Supabase URL**: Your project URL (e.g., `https://xxx.supabase.co`)
- **Supabase Anon Key**: Your anonymous/public key

These edge functions must be deployed:
- `hardiness-zone-hybrid`
- `hardiness-zone-station-finder`
- `hardiness-zone-noaa`
- `hardiness-zone-weatherapi-2010`

### 3. Development

```bash
# Serve locally for development
npm run serve

# Build for production
npm run build
```

### 4. Add to WeWeb

1. In WeWeb editor, go to **Extensions → Custom Components**
2. Click **Add Custom Component**
3. Enter your local dev server URL (shown after `npm run serve`)
4. The component will appear in your components panel

## 🔌 Connection to Map Component

### Step 1: Bind Location Inputs

In the USDA Hardiness Zone Finder component settings:

```
Input Latitude  → Bind to: [YourMap].clickedLocation.lat
Input Longitude → Bind to: [YourMap].clickedLocation.lng
```

**OR for geolocation:**

```
Input Latitude  → Bind to: [YourMap].geoLocation.lat
Input Longitude → Bind to: [YourMap].geoLocation.lng
```

### Step 2: Configure Supabase

```
Supabase URL      → Your project URL
Supabase Anon Key → Your anon key
```

### Step 3: Choose Calculation Mode

```
Calculation Mode → Auto (recommended)
```

**Available modes:**
- **Auto**: Automatically selects best data source (tries NOAA first, falls back to WeatherAPI)
- **Stations**: Find nearby weather stations (returns list for user to select)
- **NOAA**: Use NOAA historical data (most accurate, requires nearby station)
- **WeatherAPI**: Use WeatherAPI (works globally, less historical data)
- **Compare**: Run both NOAA and WeatherAPI for comparison

### Step 4: Display Results

#### Show Hardiness Zone
```
Text element:
  Content: [HardinessFinder].calculatedZone
```

#### Show Minimum Temperature
```
Text element:
  Content: [HardinessFinder].minTemperature + "°F"
```

#### Display Station Markers on Map

Use your map's marker repeat feature:

```
Repeat on: [HardinessFinder].availableStations

For each marker:
  Latitude:  item.latitude
  Longitude: item.longitude
  Color:     item.quality.color
  Label:     item.name
  Popup:     item.name + " - " + item.distance + "km"
```

#### Show Frost Dates

```
Last Spring Frost:
  [HardinessFinder].frostDates.lastSpringFrost.averageDate

First Fall Frost:
  [HardinessFinder].frostDates.firstFallFrost.averageDate

Frost-Free Days:
  [HardinessFinder].frostDates.frostFreeDays
```

#### Display Calendar Events

```
Repeat on: [HardinessFinder].calendarEvents

For each event:
  Date:        item.date
  Title:       item.title
  Type:        item.type
  Description: item.description
```

#### Show Loading State

```
Loader visibility:
  Show when: [HardinessFinder].isLoading === true
```

#### Display Errors

```
Error message:
  Show when: [HardinessFinder].errorMessage !== ""
  Content:   [HardinessFinder].errorMessage

Suggestions:
  Repeat on: [HardinessFinder].errorSuggestions
  Content:   item
```

## 📊 Exposed Internal Variables

### Location Data
- **currentLocation**: `{ lat: number, lng: number }` - Current selected location

### Zone Results
- **calculatedZone**: `string` - USDA hardiness zone (e.g., "7b", "8a")
- **minTemperature**: `number` - Average annual minimum temperature in °F

### Station Data
- **availableStations**: `array` - Nearby NOAA weather stations with quality indicators
- **selectedStation**: `object` - Currently selected station

### Growing Season Data
- **frostDates**: `object` - Historical frost date analysis
- **calendarEvents**: `array` - Planting calendar events

### Climate Data
- **moistureZone**: `object` - Precipitation and moisture analysis
- **extremeWeather**: `array` - Historical extreme weather events

### Raw Data
- **analysisResult**: `object` - Full raw API response from edge functions

### UI State
- **status**: `string` - Current status: `"idle"` | `"loading"` | `"success"` | `"error"`
- **isLoading**: `boolean` - Loading state for showing spinners
- **errorMessage**: `string` - Error message if calculation fails
- **errorSuggestions**: `array` - Array of suggested fixes for errors

## 🎯 Trigger Events

The component emits these events for workflow automation:

- **location-selected**: Fires when location is received from map
- **zone-calculated**: Fires when hardiness zone calculation completes
- **stations-found**: Fires when weather stations are retrieved
- **station-selected**: Fires when user selects a specific station
- **calculation-error**: Fires when calculation fails
- **geolocation-denied**: Fires when user denies geolocation permission

## ⚙️ Configuration Options

### Location Settings
- **Search Radius**: 0.5-10 degrees (default: 2°)
- **Max Stations**: 5-100 (default: 10)
- **Analysis Years**: 5-50 (default: 30)

### Enhancement Options
- **Elevation Adjustment**: Optional elevation in meters
- **Microclimate Factors**: Near water, urban area, wind exposed, south facing

### Automation
- **Auto-Calculate on Location Change**: Toggle (default: ON)
- **Auto-Calculate on Load**: Toggle (default: OFF)

## 🎨 Example: Basic Setup

```
1. Add Map Component to page
2. Add USDA Hardiness Finder component
3. Bind inputs:
   - Input Latitude  → [Map].clickedLocation.lat
   - Input Longitude → [Map].clickedLocation.lng
4. Configure Supabase credentials
5. Display results:
   - Text: [HardinessFinder].calculatedZone
   - Text: "Min Temp: " + [HardinessFinder].minTemperature + "°F"
```

## 🐛 Troubleshooting

### "No stations found"
- Increase search radius (try 3-5°)
- Switch to WeatherAPI mode (works globally)
- Verify location is over land (NOAA stations are land-based)

### "Invalid coordinates"
- Check latitude range: -90 to 90
- Check longitude range: -180 to 180
- Ensure map is sending numeric values, not strings

### Calculation not triggering
- Check "Auto-Calculate on Location Change" is enabled
- Verify Supabase credentials are correct
- Check browser console for errors
- Ensure edge functions are deployed

## 📝 License

MIT
