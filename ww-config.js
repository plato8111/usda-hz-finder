export default {
  editor: {
    label: {
      en: "USDA Hardiness Zone Finder",
    },
    icon: "fontawesome/solid/map-marked-alt",
  },
  properties: {
    // === LOCATION INPUT (From Map Component) ===
    inputLatitude: {
      label: { en: "Input Latitude" },
      type: "Number",
      section: "settings",
      bindable: true,
      defaultValue: null,
      /* wwEditor:start */
      bindingValidation: {
        type: "number",
        tooltip: "Bind to map's clicked/geolocation latitude"
      },
      propertyHelp: "Connect to your map component's latitude output (e.g., [Map].clickedLocation.lat)"
      /* wwEditor:end */
    },

    inputLongitude: {
      label: { en: "Input Longitude" },
      type: "Number",
      section: "settings",
      bindable: true,
      defaultValue: null,
      /* wwEditor:start */
      bindingValidation: {
        type: "number",
        tooltip: "Bind to map's clicked/geolocation longitude"
      },
      propertyHelp: "Connect to your map component's longitude output (e.g., [Map].clickedLocation.lng)"
      /* wwEditor:end */
    },

    autoCalculateOnLocationChange: {
      label: { en: "Auto-Calculate on Location Change" },
      type: "OnOff",
      section: "settings",
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "boolean"
      },
      propertyHelp: "Automatically calculate zone when inputLatitude/inputLongitude change"
      /* wwEditor:end */
    },

    // === SUPABASE CONFIGURATION ===
    supabaseUrl: {
      label: { en: "Supabase URL" },
      type: "Text",
      section: "settings",
      bindable: true,
      defaultValue: "",
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip: "Your Supabase project URL"
      },
      propertyHelp: "Enter your Supabase project URL (e.g., https://xxx.supabase.co)"
      /* wwEditor:end */
    },
    supabaseAnonKey: {
      label: { en: "Supabase Anon Key" },
      type: "Text",
      section: "settings",
      bindable: true,
      defaultValue: "",
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip: "Your Supabase anonymous key"
      },
      propertyHelp: "Enter your Supabase anonymous/public key"
      /* wwEditor:end */
    },

    // === CALCULATION MODE ===
    calculationMode: {
      label: { en: "Calculation Mode" },
      type: "TextSelect",
      section: "settings",
      options: {
        options: [
          { value: "auto", label: "Auto (Smart Selection)" },
          { value: "stations", label: "Find Stations" },
          { value: "noaa", label: "NOAA Historical Data" },
          { value: "weatherapi", label: "WeatherAPI" },
          { value: "compare", label: "Compare Methods" }
        ]
      },
      defaultValue: "auto",
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip: "Valid values: auto | stations | noaa | weatherapi | compare"
      },
      propertyHelp: "Auto mode automatically selects the best data source available"
      /* wwEditor:end */
    },

    // === LOCATION SETTINGS ===
    searchRadius: {
      label: { en: "Search Radius (degrees)" },
      type: "Number",
      section: "settings",
      min: 0.5,
      max: 10,
      step: 0.5,
      defaultValue: 2,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "number",
        tooltip: "Search radius between 0.5 and 10 degrees"
      },
      propertyHelp: "1 degree ≈ 111 km. Larger radius finds more stations but may be less accurate."
      /* wwEditor:end */
    },

    stationLimit: {
      label: { en: "Max Stations" },
      type: "Number",
      section: "settings",
      min: 5,
      max: 100,
      step: 5,
      defaultValue: 10,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "number",
        tooltip: "Maximum number of stations to display"
      }
      /* wwEditor:end */
    },

    analysisYears: {
      label: { en: "Analysis Years" },
      type: "Number",
      section: "settings",
      min: 5,
      max: 50,
      step: 5,
      defaultValue: 30,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "number",
        tooltip: "Number of years for historical analysis (5-50)"
      },
      propertyHelp: "More years = more accurate, but may not be available for all stations"
      /* wwEditor:end */
    },

    // === OPTIONAL ENHANCEMENTS ===
    userElevation: {
      label: { en: "Elevation (meters)" },
      type: "Number",
      section: "settings",
      bindable: true,
      defaultValue: null,
      /* wwEditor:start */
      bindingValidation: {
        type: "number",
        tooltip: "Optional: User's elevation for microclimate adjustment"
      },
      propertyHelp: "Leave empty to skip elevation adjustment"
      /* wwEditor:end */
    },

    enableMicroclimate: {
      label: { en: "Enable Microclimate Factors" },
      type: "OnOff",
      section: "settings",
      defaultValue: false,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: "boolean"
      }
      /* wwEditor:end */
    },

    nearWater: {
      label: { en: "Near Water" },
      type: "OnOff",
      section: "settings",
      defaultValue: false,
      bindable: true,
      hidden: (content) => !content?.enableMicroclimate,
      /* wwEditor:start */
      bindingValidation: {
        type: "boolean"
      }
      /* wwEditor:end */
    },

    urbanArea: {
      label: { en: "Urban Area" },
      type: "OnOff",
      section: "settings",
      defaultValue: false,
      bindable: true,
      hidden: (content) => !content?.enableMicroclimate,
      /* wwEditor:start */
      bindingValidation: {
        type: "boolean"
      }
      /* wwEditor:end */
    },

    windExposed: {
      label: { en: "Wind Exposed" },
      type: "OnOff",
      section: "settings",
      defaultValue: false,
      bindable: true,
      hidden: (content) => !content?.enableMicroclimate,
      /* wwEditor:start */
      bindingValidation: {
        type: "boolean"
      }
      /* wwEditor:end */
    },

    southFacing: {
      label: { en: "South Facing" },
      type: "OnOff",
      section: "settings",
      defaultValue: false,
      bindable: true,
      hidden: (content) => !content?.enableMicroclimate,
      /* wwEditor:start */
      bindingValidation: {
        type: "boolean"
      }
      /* wwEditor:end */
    },

    // === MAP SETTINGS ===
    mapHeight: {
      label: { en: "Map Height" },
      type: "Length",
      section: "style",
      defaultValue: "400px",
      bindable: true,
    },

    dashboardHeight: {
      label: { en: "Dashboard Height" },
      type: "Length",
      section: "style",
      defaultValue: "600px",
      bindable: true,
    },

    primaryColor: {
      label: { en: "Primary Color" },
      type: "Color",
      section: "style",
      defaultValue: "#22c55e",
      bindable: true,
    },

    secondaryColor: {
      label: { en: "Secondary Color" },
      type: "Color",
      section: "style",
      defaultValue: "#3b82f6",
      bindable: true,
    },

    backgroundColor: {
      label: { en: "Background Color" },
      type: "Color",
      section: "style",
      defaultValue: "#ffffff",
      bindable: true,
    },

    borderRadius: {
      label: { en: "Border Radius" },
      type: "Length",
      section: "style",
      defaultValue: "12px",
      bindable: true,
    },

    // === UI TOGGLES ===
    showGeolocationButton: {
      label: { en: "Show Geolocation Button" },
      type: "OnOff",
      section: "settings",
      defaultValue: true,
      bindable: true,
    },

    showModeSelector: {
      label: { en: "Show Mode Selector" },
      type: "OnOff",
      section: "settings",
      defaultValue: true,
      bindable: true,
    },

    showStationQuality: {
      label: { en: "Show Station Quality" },
      type: "OnOff",
      section: "settings",
      defaultValue: true,
      bindable: true,
    },

    showCalendarEvents: {
      label: { en: "Show Calendar Events" },
      type: "OnOff",
      section: "settings",
      defaultValue: true,
      bindable: true,
    },

    autoCalculateOnLoad: {
      label: { en: "Auto-Calculate on Load" },
      type: "OnOff",
      section: "settings",
      defaultValue: false,
      bindable: true,
      /* wwEditor:start */
      propertyHelp: "Automatically request geolocation and calculate zone when component loads"
      /* wwEditor:end */
    },
  },

  // === ACTION PROPERTIES (Methods users can trigger) ===
  actions: [
    {
      name: "requestGeolocation",
      label: { en: "Request Geolocation" },
      /* wwEditor:start */
      propertyHelp: "Trigger browser geolocation prompt and calculate zone"
      /* wwEditor:end */
    },
    {
      name: "calculateForLocation",
      label: { en: "Calculate for Location" },
      parameters: [
        { name: "lat", type: "number" },
        { name: "lng", type: "number" }
      ],
      /* wwEditor:start */
      propertyHelp: "Calculate hardiness zone for specific coordinates"
      /* wwEditor:end */
    },
    {
      name: "selectStation",
      label: { en: "Select Station" },
      parameters: [
        { name: "stationId", type: "string" }
      ],
      /* wwEditor:start */
      propertyHelp: "Calculate zone using specific NOAA station"
      /* wwEditor:end */
    },
    {
      name: "clearResults",
      label: { en: "Clear Results" },
      /* wwEditor:start */
      propertyHelp: "Reset all calculation results"
      /* wwEditor:end */
    }
  ],

  triggerEvents: [
    {
      name: "location-selected",
      label: { en: "Location Selected" },
      event: {
        lat: 0,
        lng: 0,
        source: "click" // "click" | "geolocation"
      },
    },
    {
      name: "zone-calculated",
      label: { en: "Zone Calculated" },
      event: {
        zone: "",
        minTemp: 0,
        mode: "",
        location: {}
      },
    },
    {
      name: "stations-found",
      label: { en: "Stations Found" },
      event: {
        stations: [],
        totalFound: 0
      },
    },
    {
      name: "station-selected",
      label: { en: "Station Selected" },
      event: {
        stationId: "",
        name: "",
        distance: 0,
        quality: {}
      },
    },
    {
      name: "calculation-error",
      label: { en: "Calculation Error" },
      event: {
        error: "",
        suggestions: []
      },
    },
    {
      name: "geolocation-denied",
      label: { en: "Geolocation Denied" },
      event: {
        message: ""
      },
    },
  ],
};
