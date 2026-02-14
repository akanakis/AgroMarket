# AgroMarket - Farm-to-Table Marketplace

**Fresh, Local, Organic.**

AgroMarket is a comprehensive platform connecting local farmers directly with consumers, promoting sustainable agriculture and healthy eating. It features a modern web frontend, a robust Python backend, and a brand-new React Native mobile application for on-the-go access.

## 📱 Mobile App Features (New!)

The mobile application brings the full marketplace experience to your iOS and Android devices:

*   **Dual User Roles**: Seamless experience for both **Producers** (farmers) and **Consumers**.
*   **Rich Marketplace**:
    *   Browse fresh produce with **Category Filters** (Vegetables 🥬, Fruits 🍎, Dairy 🥚, Wine 🍷, and more).
    *   **Advanced Filtering**: Sort by Price, Newest, Best Rated. Filter by Price Range and Organic Status.
    *   **Search**: Find products by name, location, or producer.
*   **Product Management (Producers)**:
    *   Add new products with details like price, unit, organic certification, and images.
    *   "My Listings" dashboard to manage active products.
*   **Order Management**:
    *   **Track Orders**: View order history with status updates (Processing, Shipped, Completed).
    *   **Detailed Views**: Expand orders to see individual items.
    *   **Product Reviews**: Leave star ratings and comments for specific products on completed orders.
*   **Internationalization 🌍**: Use the app in your preferred language:
    *   🇬🇧 English
    *   🇬🇷 Greek (Ελληνικά)
    *   🇩🇪 German (Deutsch)
    *   🇫🇷 French (Français)
*   **User Profiles**: Manage profile settings, switch language, and view role-specific stats.

## 🛠️ Technology Stack

*   **Mobile**: React Native (Expo), TypeScript, React Navigation, Lucide Icons.
*   **Backend**: Python (FastAPI), SQLite, Uvicorn.
*   **Web Frontend**: React.js (legacy/web platform).

## 🚀 Getting Started

### Prerequisites

*   **Node.js** (v18+)
*   **Python** (3.9+)
*   **Expo Go** app on your mobile device (iOS/Android) or a simulator.

### 1. Backend Setup

Navigate to the backend directory and activate the virtual environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*Note: Ensure your mobile device is on the same network as your computer to access the local backend.*

### 2. Mobile App Setup

Navigate to the mobile directory:

```bash
cd mobile
npm install
npx expo start --clear
```

Scan the QR code with the **Expo Go** app on your phone, or press `i` to run in the iOS Simulator / `a` for Android Emulator.

### 3. Web Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the web app.

## 📂 Project Structure

*   `mobile/`: React Native application code.
    *   `src/screens/`: UI screens (Marketplace, Orders, AddProduct, etc.).
    *   `src/components/`: Reusable UI components (ProductCard, ReviewModal, etc.).
    *   `src/utils/translations.ts`: Localization strings for EN/EL/DE/FR.
*   `backend/`: FastAPI server and database.
*   `frontend/`: React web application.

## 📝 License

This project is licensed under the MIT License.
