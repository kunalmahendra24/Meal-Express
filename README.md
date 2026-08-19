# Meal Express - Homemade Tiffin Food Ordering Platform

A full-stack MERN (MongoDB, Express, React, Node.js) web application for ordering homemade tiffin (dabba) meals with delivery tracking.

![Meal Express](https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800)

## Features

### User Features
- Browse homemade tiffin meals without login
- View meal details with images, description, price, and category (Veg/Non-Veg/Jain)
- Add meals to cart and place orders
- User profile management with saved addresses
- Order history with status tracking (Pending → Preparing → Out for Delivery → Delivered)
- "Call Owner" button for direct contact
- Mobile-first responsive design

### Admin Dashboard
- Secure admin login with role-based access
- Dashboard with analytics (orders, revenue, daily stats)
- Meal management (CRUD operations with image upload)
- Order management with status updates
- User management (roles, status)
- Settings management (owner phone, delivery charges, etc.)
- Toggle Call Owner feature

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Context API** for state management
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Lucide React** for icons

## Project Structure

```
meal-express/
├── client/                  # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # State management
│   │   ├── pages/           # Page components
│   │   │   └── admin/       # Admin dashboard pages
│   │   ├── App.jsx          # Main app component
│   │   └── index.css        # Global styles
│   └── index.html
│
├── server/                  # Node.js Backend
│   ├── config/              # Configuration files
│   ├── controller/          # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── uploads/             # Uploaded files
│   └── server.js            # Entry point
│
└── README.md
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd meal-express
```

2. **Setup Backend**
```bash
cd server
cp .env.example .env
# Edit .env with your configuration
npm install
```

3. **Setup Frontend**
```bash
cd client
cp .env.example .env
# Edit .env if needed
npm install
```

4. **Configure Environment Variables**

Backend `.env`:
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/meal-express
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SENDER_EMAIL=noreply@mealexpress.com
FRONTEND_URL=http://localhost:5173
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:4000
```

5. **Run the Application**

Start Backend:
```bash
cd server
npm run dev
```

Start Frontend (in a new terminal):
```bash
cd client
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/is-auth` - Check authentication status

### Meals (Public)
- `GET /api/meals` - Get all meals (with filters)
- `GET /api/meals/:id` - Get meal details
- `GET /api/meals/featured` - Get featured meals
- `GET /api/meals/category/:category` - Get meals by category

### Meals (Admin)
- `POST /api/meals` - Create meal
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal
- `POST /api/meals/upload-image` - Upload meal image

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/my-orders/:id` - Get order details
- `PATCH /api/orders/:id/cancel` - Cancel order

### User Profile
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/addresses` - Get addresses
- `POST /api/user/addresses` - Add address
- `PUT /api/user/addresses/:id` - Update address
- `DELETE /api/user/addresses/:id` - Delete address

### Settings
- `GET /api/settings/public` - Get public settings
- `GET /api/settings/owner-phone` - Get owner phone (Call Owner feature)

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/role` - Update user role
- `GET /api/orders/admin/all` - Get all orders
- `PATCH /api/orders/admin/:id/status` - Update order status
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update setting

## Creating an Admin User

1. Register a regular user through the app
2. Connect to MongoDB and update the user's role:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or for super admin:
```javascript
db.users.updateOne(
  { email: "superadmin@example.com" },
  { $set: { role: "super_admin" } }
)
```

## Default Settings

The application initializes with these default settings:
- Owner Phone: +91 9876543210
- Call Owner Enabled: true
- Minimum Order: ₹100
- Delivery Charge: ₹30
- Free Delivery Above: ₹500

## Screenshots

### User Interface
- Home Page with featured meals
- Menu with category filters
- Meal details with images, pricing, and nutrition info
- Shopping cart
- Checkout with address selection
- Order tracking

### Admin Dashboard
- Analytics overview
- Meals management
- Orders management
- Users management
- Settings configuration

## Deployment

### Backend (e.g., Render, Railway)
1. Set environment variables in the hosting platform
2. Deploy the `server` directory
3. Ensure MongoDB connection string is set

### Frontend (e.g., Vercel, Netlify)
1. Set `VITE_API_URL` to your backend URL
2. Deploy the `client` directory
3. Configure build command: `npm run build`
4. Configure output directory: `dist`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For questions or issues, please open a GitHub issue or contact the development team.
