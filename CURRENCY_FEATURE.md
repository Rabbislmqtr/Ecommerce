# Multi-Currency Support Feature

## Overview
The ecommerce application now supports multi-currency functionality. Prices can be displayed in USD (US Dollar), BDT (Bangladeshi Taka), and INR (Indian Rupee) with automatic conversion based on exchange rates.

## Supported Currencies
- **USD** - US Dollar ($) - Default
- **BDT** - Bangladeshi Taka (৳) 
- **INR** - Indian Rupee (₹)

## Exchange Rates (relative to USD)
- 1 USD = 1.00 USD
- 1 USD = 119.50 BDT
- 1 USD = 83.20 INR

## How It Works

### For Customers
1. **Select Currency**: Use the currency dropdown selector in the header of any shop page (Products, Product Details, Cart, Checkout, Wishlist)
2. **Automatic Conversion**: All prices on the page instantly update to the selected currency
3. **Persistent Selection**: Your currency preference is saved and will be remembered when you return

### For Administrators
1. Go to **Admin Settings** page
2. Scroll to **E-commerce Settings** section
3. Select the **Default Currency** from the dropdown:
   - USD (US Dollar)
   - BDT (Bangladeshi Taka)
   - INR (Indian Rupee)
4. Click **Save Settings**
5. This sets the default currency for new visitors

## Implementation Details

### New Files
- **js/currency.js** - Main currency module with conversion logic and event handling

### Modified Files
- **js/utils.js** - Updated `formatCurrency()` function to use Currency module
- **admin/settings.html** - Added currency selector dropdown
- **js/admin/admin-settings.js** - Added currency handling in settings save/load
- **index.html, products.html, product-detail.html, cart.html, checkout.html, wishlist.html** - Added currency dropdown in header and currency.js script
- **css/style.css** - Added styling for currency selector

### Currency Module (currency.js)

#### Key Methods:
- `Currency.init()` - Initialize currency from localStorage
- `Currency.setCurrency(currency)` - Change currency and trigger updates
- `Currency.getCurrency()` - Get current currency
- `Currency.convertPrice(priceInUsd, targetCurrency)` - Convert price from USD
- `Currency.formatPrice(priceInUsd, currency)` - Format price with currency symbol
- `Currency.notifyCurrencyChange()` - Trigger price reload across page

#### Event System:
The currency module uses a custom event `currencyChanged` to notify all components when the currency changes:

```javascript
window.addEventListener('currencyChanged', (e) => {
  // Prices are automatically reloaded
});
```

## Price Storage
All prices in the database and products.json are stored in **USD**. The conversion happens dynamically at display time, ensuring accurate pricing regardless of selected currency.

## Usage Examples

### For Displaying Prices
```javascript
// Old way (hardcoded USD):
Utils.formatCurrency(99.99)  // Returns: $99.99

// Now automatically uses selected currency:
Utils.formatCurrency(99.99)  // Returns: $99.99 (USD) or ৳11,945.50 (BDT) or ₹8,318.81 (INR)
```

### For Changing Currency Programmatically
```javascript
Currency.setCurrency('BDT');  // Changes to Bangladeshi Taka
Currency.setCurrency('INR');  // Changes to Indian Rupee
Currency.setCurrency('USD');  // Changes back to US Dollar
```

## LocalStorage
Currency preferences are stored in localStorage under the key: `selectedCurrency`

Admin settings are stored under: `siteSettings`

## Browser Compatibility
- Works on all modern browsers
- Uses Intl API for proper number formatting by locale
- LocalStorage support required

## Adding New Currencies
To add a new currency to the system:

1. Open **js/currency.js**
2. Add exchange rate to `exchangeRates` object:
   ```javascript
   exchangeRates: {
     USD: 1,
     BDT: 119.50,
     INR: 83.20,
     GBP: 0.79,  // New currency
   }
   ```
3. Add symbol to `symbols` object:
   ```javascript
   symbols: {
     ...existing,
     GBP: '£',
   }
   ```
4. Add name to `names` object:
   ```javascript
   names: {
     ...existing,
     GBP: 'British Pound',
   }
   ```
5. Add option to settings.html dropdown:
   ```html
   <option value="GBP">GBP - British Pound (£)</option>
   ```
6. Add option to all customer-facing page header dropdowns

## Testing
- Test currency switching on all product pages
- Verify cart and checkout totals update correctly
- Test that currency persists after page refresh
- Test admin settings currency change
- Verify correct exchange rates are applied

## Notes
- All calculations are done with proper floating-point formatting
- Locale-specific number formatting is applied per currency
- Exchange rates can be updated in the currency.js file
- No backend changes required; all conversion happens client-side
