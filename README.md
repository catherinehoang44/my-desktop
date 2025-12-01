# Retro Desktop - MERN Stack Application

A retro-style desktop interface built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Menu Bar**: File, Edit, View, Go, Window, and Help dropdowns
- **Desktop Icons**: Recycle Bin, Paint, Notepad, Calculator, My Documents, and Images
- **Image Gallery**: Upload, view, and delete images with MongoDB storage
- **Retro Styling**: Classic retro computer interface design
- **Interactive Elements**: Click icons to select, double-click to "open" applications

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Install root dependencies:**

   ```bash
   npm install
   ```

2. **Install server dependencies:**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies:**

   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables:**

   - Copy `server/.env.example` to `server/.env`
   - Update the MongoDB URI if needed:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/retro-desktop
     NODE_ENV=development
     ```

5. **Add background image:**

   - Place `retro-site-bg.png` in `client/public/` directory

6. **Add Dogica Pixel font (optional):**
   - Place font files (Dogica.woff2, Dogica.woff, or Dogica.ttf) in `client/src/fonts/` directory
   - Or modify `client/src/index.css` to use a system font

## Running the Application

### Development Mode (runs both server and client)

From the root directory:

```bash
npm run dev
```

This will start:

- Backend server on `http://localhost:5000`
- React development server on `http://localhost:3000`

### Run Server and Client Separately

**Backend only:**

```bash
npm run server
```

**Frontend only:**

```bash
npm run client
```

## Project Structure

```
retro-desktop/
├── client/                 # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── retro-site-bg.png (add your image here)
│   └── src/
│       ├── components/
│       │   ├── MenuBar.js
│       │   ├── Desktop.js
│       │   ├── DesktopIcon.js
│       │   └── ImageGallery.js
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       └── index.css
├── server/                 # Express backend
│   ├── models/
│   │   ├── DesktopItem.js
│   │   └── Image.js
│   ├── routes/
│   │   ├── desktop.js
│   │   └── images.js
│   ├── index.js
│   └── .env
└── package.json
```

## API Endpoints

### Desktop Items

- `GET /api/desktop/items` - Get all desktop items
- `POST /api/desktop/items` - Create a new desktop item
- `PUT /api/desktop/items/:id` - Update desktop item position
- `DELETE /api/desktop/items/:id` - Delete desktop item

### Images

- `GET /api/images` - Get all images
- `POST /api/images/upload` - Upload an image (multipart/form-data)
- `DELETE /api/images/:id` - Delete an image

## Technologies Used

- **Frontend**: React 18
- **Backend**: Express.js
- **Database**: MongoDB with Mongoose
- **File Upload**: Multer
- **HTTP Client**: Axios

## Screen Dimensions

The desktop is designed for **1365.33px × 1024px** resolution.

## Customization

- Modify icon positions in `client/src/components/Desktop.js`
- Customize colors and styling in `client/src/App.css`
- Add new menu items in `client/src/components/MenuBar.js`
- Extend API routes in `server/routes/`

## Production Build

1. Build the React app:

   ```bash
   cd client
   npm run build
   ```

2. Set `NODE_ENV=production` in `server/.env`

3. Start the server:
   ```bash
   cd server
   npm start
   ```

The server will serve the built React app from `client/build/`.
