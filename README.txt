# Women's Fashion E-commerce Website

## Overview
A complete frontend-only women's clothing e-commerce website with shopping cart, checkout, and user authentication features.

## Features Implemented
✅ User Authentication (Register/Login/Logout using localStorage)
✅ Product Catalog with 30 women's clothing items
✅ Product Search and Filtering (Category, Size, Color, Price)
✅ Product Sorting (Price, Name)
✅ Shopping Cart with quantity management
✅ Wishlist functionality
✅ Checkout process with form validation
✅ Order confirmation with simulated email notification
✅ Responsive design (Mobile, Tablet, Desktop)
✅ Data persistence using localStorage

## How to Use

### Getting Started
1. Open `index.html` in a web browser
2. No server or build process required - runs directly in the browser

### User Flow
1. **Browse Products**: Visit the homepage or products page to see all items
2. **Register/Login**: Create an account or login (stored in localStorage)
3. **Filter Products**: Use the sidebar filters to narrow down products by category, size, color, and price
4. **Search**: Use the search box to find specific items
5. **Add to Wishlist**: Click the heart icon on any product
6. **View Product Details**: Click "View Details" to see full product information
7. **Add to Cart**: Select size and color, then add items to cart
8. **Checkout**: 
   - Review cart items
   - Fill in shipping information
   - Place order (no payment required)
9. **Order Confirmation**: View order details and confirmation

### Admin Access
- Orders are stored in localStorage under the key `orders`
- View orders by opening browser DevTools > Application > Local Storage

## Technology Stack
- HTML5
- CSS3 (Flexbox, Grid, CSS Variables)
- Vanilla JavaScript (ES6+)
- localStorage for data persistence

## File Structure
```
Ecommerce/
├── index.html                 # Homepage
├── products.html              # Product listing with filters
├── product-detail.html        # Single product view
├── cart.html                  # Shopping cart
├── checkout.html              # Checkout form
├── login.html                 # Login page
├── register.html              # Registration page
├── wishlist.html              # Wishlist
├── order-confirmation.html    # Order success page
├── css/
│   ├── style.css             # Global styles
│   ├── products.css          # Product-specific styles
│   ├── cart.css              # Cart & checkout styles
│   └── responsive.css        # Mobile responsive styles
├── js/
│   ├── app.js                # Main application logic
│   ├── products.js           # Product display & management
│   ├── cart.js               # Cart functionality
│   ├── auth.js               # Authentication
│   ├── filters.js            # Product filtering
│   ├── wishlist.js           # Wishlist management
│   ├── checkout.js           # Checkout & order processing
│   └── utils.js              # Utility functions
└── data/
    └── products.json         # Product data (30 items)
```

## Key Features Details

### Authentication
- Registration with name, email, and password (min 6 chars)
- Login with email and password
- Session management using localStorage
- Protected checkout route (requires login)

### Product Management
- 30 products across 5 categories:
  - Dresses
  - Tops
  - Bottoms
  - Outerwear
  - Accessories
- Each product has: name, price, sizes, colors, images, description

### Filtering & Search
- Real-time search by product name/description
- Filter by category (multiple selection)
- Filter by size (XS, S, M, L, XL)
- Filter by color
- Price range slider ($0-$200)
- Sort by price (low-high, high-low) and name (A-Z, Z-A)

### Shopping Cart
- Add/remove items
- Update quantities
- Automatic total calculation
- Tax calculation (8%)
- Cart persists across sessions
- Empty cart validation

### Wishlist
- Add/remove products
- User-specific (linked to logged-in user)
- Heart icon toggle on products
- Quick view and add to cart from wishlist

### Checkout
- Form validation for all fields:
  - Name, email (format validation)
  - Phone (10 digits)
  - Address, city, state
  - Zip code (5-6 digits)
- Order summary with items, subtotal, tax, shipping
- Generate unique order ID
- Store order in localStorage
- Simulate email notification (console log)
- Clear cart after successful order

### Order Management
- Order confirmation page with full details
- Order history stored in localStorage
- Console log shows simulated email with order details

## localStorage Keys
- `users` - Array of registered users
- `currentUser` - Currently logged-in user
- `cart` - Shopping cart items
- `wishlist_[userId]` - User-specific wishlist
- `orders` - Array of all orders
- `lastOrder` - Most recent order for confirmation page

## Responsive Breakpoints
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3-4 columns)

## Manual Payment Note
As requested, no payment integration is included. The checkout process:
1. Validates and collects customer information
2. Creates an order with "pending" status
3. Displays confirmation to the customer
4. Logs order details to console (simulating email)
5. Stores order in localStorage for manual processing

The business owner can:
- View orders in localStorage
- Contact customers manually for payment
- Process payments offline

## Browser Compatibility
Works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Future Enhancements (Optional)
- Admin panel to view orders
- Export orders to CSV/Excel
- Email integration using third-party service
- Product reviews and ratings
- Size guide
- Recently viewed products
- Related products suggestions

## Support
For any issues or questions, check the browser console for error messages.
All data is stored locally in the browser's localStorage.
