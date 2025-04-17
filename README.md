# EasyBus - Bus Ticket Booking System

EasyBus is a comprehensive bus ticket booking platform that connects travelers with bus operators, providing a seamless booking experience.

## Features

### User Features
- User registration and authentication
- Search buses by source, destination, and date
- View available seats and book tickets
- Make payments through a secure payment gateway
- View booking history and print tickets
- Booking time window restrictions

### Admin Features
- Comprehensive admin dashboard
- Manage buses, routes, and schedules
- User management
- Agent management
- Booking oversight and reports

### Agent Features
- Agent-specific login
- Manage bookings for customers
- Access to specialized agent tools

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios for API communication

### Backend
- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- Nodemailer for email services

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/easybus.git
cd easybus
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. **Environment Setup**
```bash
# In the server directory, create a .env file based on .env.example
cp .env.example .env
# Edit the .env file with your configuration
```

4. **Run the application**
```bash
# From the root directory
npm run dev
```

This will start both the client (on port 3000) and server (on port 5001) concurrently.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/agent/login` - Agent login

### Buses
- `GET /api/buses` - List all buses
- `GET /api/buses/:id` - Get bus details
- `POST /api/buses` - Add new bus (admin)
- `PATCH /api/buses/:id` - Update bus (admin)
- `DELETE /api/buses/:id` - Remove bus (admin)
- `GET /api/buses/all-public` - Get all public buses

### Bookings
- `GET /api/bookings` - List all bookings (admin)
- `GET /api/bookings/user/:userId` - Get user's bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Agents
- `GET /api/agents` - List all agents (admin)
- `POST /api/agents` - Register agent (admin)
- `PATCH /api/agents/:id/verify` - Verify agent (admin)
- `PATCH /api/agents/:id/status` - Update agent status (admin)
- `DELETE /api/agents/:id` - Remove agent (admin)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- All contributors who have helped with the development of EasyBus
- The amazing open-source community for the tools and libraries used in this project
