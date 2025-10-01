# USDA Hardiness Zone Dashboard Component

A sophisticated, modern dashboard UI component for displaying USDA Hardiness Zone data in WeWeb applications.

## Features

### 🎨 Visual Design
- **Modern Card-Based Layout** - Responsive grid system that adapts to all screen sizes
- **Hero Zone Card** - Large, gradient-styled card showcasing the primary hardiness zone
- **Smooth Animations** - Fade-ins, slide-ups, and hover effects for enhanced UX
- **Dark Mode Support** - Built-in light/dark theme switching
- **Compact Mode** - Space-efficient layout option for smaller viewports

### 📊 Data Visualization

**Displays 200% of Available Data:**

1. **Hardiness Zone Card (Hero)**
   - Large zone number display
   - Minimum temperature (with unit conversion)
   - Zone description with climate details
   - Data source attribution

2. **Location Card**
   - Precise latitude/longitude coordinates
   - Formatted to 4 decimal places

3. **Frost Dates Card**
   - Last spring frost date
   - First fall frost date
   - Calculated growing season length (days)
   - Color-coded visualization

4. **Weather Stations Card**
   - List of available weather stations
   - Station quality indicators with color coding
   - Distance from location (km/miles)
   - Quality score progress bars
   - Click-to-select functionality
   - Show more/less toggle

5. **Moisture Zone Card**
   - Moisture zone classification
   - Average annual precipitation
   - Descriptive explanation

6. **Planting Calendar Card**
   - Timeline of planting events
   - Date-based recommendations
   - Event descriptions

7. **Extreme Weather Card**
   - Historical extreme weather events
   - Severity indicators (high/medium/low)
   - Event type, date, and values

### 🔄 Loading States

**Intelligent Progress Indicators:**
- Real-time loading status messages
- Progressive detail display:
  - "Initializing..."
  - "Locating position..."
  - "Searching weather stations..."
  - "Found X stations"
- Smooth spinner animation
- Contextual progress updates based on actual API state

### ⚠️ Error Handling
- Clear error messaging
- Actionable suggestions
- Graceful fallbacks
- User-friendly error states

### 🎛️ Customization Options

**Style Properties:**
- Theme (light/dark/auto)
- Accent color
- Background color
- Card background color
- Text color
- Border radius

**Display Toggles:**
- Show/hide individual cards
- Compact mode toggle
- Animations enable/disable

## Installation

1. Add component folder to your WeWeb project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the component:
   ```bash
   npm run build
   ```

4. Serve for development:
   ```bash
   npm run serve --port=8080
   ```

## Usage in WeWeb

### 1. Add Both Components

Add both the USDA HZ Finder (data provider) and Dashboard (UI) to your page.

### 2. Bind Data Properties

In the Dashboard component settings, bind all data properties:

```
currentLocation → [Finder].currentLocation
calculatedZone → [Finder].calculatedZone
minTemperature → [Finder].minTemperature
minTemperatureConverted → [Finder].minTemperatureConverted
temperatureUnitLabel → [Finder].temperatureUnitLabel
availableStations → [Finder].availableStations
availableStationsConverted → [Finder].availableStationsConverted
distanceUnitLabel → [Finder].distanceUnitLabel
selectedStation → [Finder].selectedStation
frostDates → [Finder].frostDates
calendarEvents → [Finder].calendarEvents
moistureZone → [Finder].moistureZone
extremeWeather → [Finder].extremeWeather
analysisResult → [Finder].analysisResult
status → [Finder].status
isLoading → [Finder].isLoading
errorMessage → [Finder].errorMessage
errorSuggestions → [Finder].errorSuggestions
```

### 3. Customize Appearance

Configure styling options:
- **Theme**: Choose light, dark, or auto
- **Accent Color**: Primary brand color (#22c55e default)
- **Border Radius**: Roundness of cards (12px default)
- **Compact Mode**: Enable for smaller spaces

### 4. Toggle Card Visibility

Show/hide specific sections:
- Location Card
- Zone Card
- Stations Card
- Frost Dates Card
- Moisture Card
- Calendar Card
- Extreme Weather Card

## Component Architecture

### Props (from ww-config.js)

All data properties are bindable and reactive:

- **Data Bindings** (17 properties)
  - Location, zone, temperature data
  - Station information (raw and converted)
  - Frost dates, calendar events
  - Moisture and extreme weather data
  - Status and error states

- **Display Settings** (6 properties)
  - Theme, colors, border radius
  - Background and card colors

- **UI Toggles** (8 properties)
  - Card visibility controls
  - Compact mode
  - Animations toggle

### Events

**station-clicked**
- Emitted when user clicks a weather station
- Payload: `{ stationId, station }`
- Use for triggering station selection in Finder component

## Technical Details

### File Structure
```
usda-hz-dashboard/
├── src/
│   └── wwElement.vue       # Main component (template + script + styles)
├── ww-config.js             # WeWeb configuration
├── package.json
└── README.md
```

### Responsive Design
- Desktop: Multi-column grid layout
- Tablet: 2-column adaptive grid
- Mobile: Single-column stacked layout

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox
- CSS Custom Properties (variables)

### Performance
- Lazy computed properties
- Conditional rendering
- Optimized animations (GPU-accelerated)
- Efficient watchers

## Development

### Local Development
```bash
npm run serve --port=8080
```

### Production Build
```bash
npm run build
```

### WeWeb CLI
Built with `@weweb/cli` for seamless WeWeb integration.

## CLAUDE.md Compliance

✅ Optional chaining on all props
✅ Fully reactive computed properties
✅ No manual refs for derived data
✅ Proper wwEditor blocks
✅ No build configuration files
✅ Professional component standards

## Examples

### Basic Setup
```javascript
// Bind Finder component to Dashboard
Dashboard.currentLocation = Finder.currentLocation
Dashboard.status = Finder.status
Dashboard.isLoading = Finder.isLoading
// ... bind all other properties
```

### Custom Styling
```javascript
Dashboard.theme = "dark"
Dashboard.accentColor = "#3b82f6"
Dashboard.compactMode = true
```

### Station Selection Workflow
```javascript
// When user clicks a station in Dashboard
on Dashboard.station-clicked {
  Finder.selectStation(event.stationId)
}
```

## License

MIT

## Support

For issues or questions:
- Check CLAUDE.md for development guidelines
- Review ww-config.js for property definitions
- Inspect wwElement.vue for component logic

---

**Built with ❤️ using WeWeb Custom Elements**
