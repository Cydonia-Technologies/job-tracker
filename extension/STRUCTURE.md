// =====================================================
// CHROME EXTENSION PROJECT STRUCTURE
// =====================================================

/*
extension/
├── manifest.json                    # Extension configuration
├── background/
│   └── background.js               # Service worker for API calls
├── content/
│   ├── content.js                  # Main content script
│   ├── extractors/
│   │   ├── indeed.js              # Indeed-specific extraction
│   │   ├── linkedin.js            # LinkedIn-specific extraction
│   │   └── nittany.js             # Nittany Careers extraction
│   └── ui/
│       ├── overlay.js             # Job save overlay UI
│       └── overlay.css            # Overlay styling
├── popup/
│   ├── popup.html                 # Extension popup interface
│   ├── popup.js                   # Popup functionality
│   └── popup.css                  # Popup styling
├── options/
│   ├── options.html               # Extension settings page
│   ├── options.js                 # Settings functionality
│   └── options.css                # Settings styling
├── assets/
│   ├── icons/
│   │   ├── icon16.png            # 16x16 icon
│   │   ├── icon48.png            # 48x48 icon
│   │   └── icon128.png           # 128x128 icon
│   └── images/
│       └── logo.png              # Extension logo
└── utils/
    ├── api.js                    # Backend API client
    ├── storage.js                # Chrome storage utilities
    └── constants.js              # Shared constants
*/
