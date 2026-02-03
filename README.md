# AgroMarket

AgroMarket is a web platform connecting local farmers directly with buyers. It allows producers to list their fresh produce and buyers to purchase high-quality local goods.

## Features

- **For Buyers**:
  - Browse local products (vegetables, fruits, dairy, etc.).
  - Filter by category, organic status, and price.
  - Add items to cart and place orders.
  - Track orders (coming soon).

- **For Sellers (Producers)**:
  - Dashboard to manage product listings.
  - View total revenue and active listings.
  - Manage incoming orders.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker (optional, for backend database)

### Installation & Running

#### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Backend

The backend is containerized. To run it:

1. Navigate to the backend directory (or root):
   ```bash
   cd backend
   ```
2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
