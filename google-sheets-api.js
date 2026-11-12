// Google Sheets API Configuration
// Replace these with your actual values after deploying the Google Apps Script
const GOOGLE_SHEETS_CONFIG = {
    // Your Google Apps Script Web App URL (get this after deployment)
    apiUrl: 'https://script.google.com/macros/s/AKfycbzIUPUsedE_8ViXiG9VAUs2NmVm7oTh1AabeThfdAvmpzFosXEV9YCSy_VUNrvy41xs/exec',
    
    // Optional: API Key if you set one in the Apps Script
    apiKey: '',
    
    // Sheet name in your Google Spreadsheet
    sheetName: 'Donors'
};

// API Functions
class GoogleSheetsAPI {
    constructor(config) {
        this.config = config;
        this.cache = null;
        this.cacheTime = 0;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes cache
    }

    // Build URL with API key if provided
    buildUrl(action, params = {}) {
        const url = new URL(this.config.apiUrl);
        url.searchParams.append('action', action);
        if (this.config.apiKey) {
            url.searchParams.append('key', this.config.apiKey);
        }
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        return url.toString();
    }

    // Generic fetch with error handling (for GET requests)
    async fetchData(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Unknown API error');
            }
            return data.data;
        } catch (error) {
            console.error('Google Sheets API Error:', error);
            throw error;
        }
    }

    // Send POST request with JSON payload (using text/plain to avoid CORS preflight)
    async postData(action, data) {
        const payload = {
            action: action,
            sheet: this.config.sheetName,
            ...(this.config.apiKey ? { key: this.config.apiKey } : {}),
            ...data
        };

        try {
            const response = await fetch(this.config.apiUrl, {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'API error');
            }
            
            return result.data;
        } catch (error) {
            console.error('❌ Google Sheets API POST Error:', error);
            throw error;
        }
    }

    // Get all donors from Google Sheets
    async getDonors(useCache = true) {
        // Check cache
        if (useCache && this.cache && (Date.now() - this.cacheTime < this.cacheDuration)) {
            return this.cache;
        }

        const url = this.buildUrl('getDonors', { sheet: this.config.sheetName });
        const data = await this.fetchData(url);

        // Transform data to match existing format
        this.cache = data.map((row, index) => ({
            id: row.id || index + 1,
            name: row.name || '',
            area: row.area || '',
            bloodType: row.bloodType || '',
            image: row.image || `https://img.icons8.com/?size=100&id=11178&format=png&color=000000`,
            phone: row.phone || ''
        }));

        this.cacheTime = Date.now();
        return this.cache;
    }

    // Add a new donor to Google Sheets
    async addDonor(donorData) {
        const result = await this.postData('addDonor', donorData);
        
        // Invalidate cache
        this.cache = null;
        this.cacheTime = 0;

        return result;
    }

    // Update a donor in Google Sheets
    async updateDonor(id, donorData) {
        const result = await this.postData('updateDonor', { ...donorData, id });
        
        // Invalidate cache
        this.cache = null;
        this.cacheTime = 0;

        return result;
    }

    // Delete a donor from Google Sheets
    async deleteDonor(id) {
        const result = await this.postData('deleteDonor', { id });
        
        // Invalidate cache
        this.cache = null;
        this.cacheTime = 0;

        return result;
    }

    // Clear cache
    clearCache() {
        this.cache = null;
        this.cacheTime = 0;
    }
}

// Export for use in other files
window.GoogleSheetsAPI = GoogleSheetsAPI;
window.GOOGLE_SHEETS_CONFIG = GOOGLE_SHEETS_CONFIG;