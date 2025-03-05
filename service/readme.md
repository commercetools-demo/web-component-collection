# Backend Service

REST API service supporting the web components.

## API Endpoints

### GET /getGoogleMapApiKey
Returns the Google Maps API key for map initialization.

**Response**: `string` (API key)

### GET /getStores
Returns stores near a specified location.

**Query Parameters**:
- `lat` (number, required) - Latitude
- `lng` (number, required) - Longitude
- `locale` (string, optional) - Localization preference

**Response**:
```json
[
  {
    "storeId": "store123",
    "key": "store-key",
    "name": "Store Name",
    "distributionChannels": [
      {
        "id": "channel1",
        "name": "Channel 1"
      }
    ],
    "supplyChannels": [
      {
        "id": "supply1",
        "name": "Supply 1"
      }
    ],
    "geoLocation": {
      "lat": 52.5200,
      "lng": 13.4050
    }
  }
]
```

### GET /getStoreById
Returns a specific store by ID.

**Query Parameters**:
- `storeId` (string, required) - Store ID
- `locale` (string, optional) - Localization preference

**Response**: Same as store object above

## Development

```bash
npm install
npm run dev
```
