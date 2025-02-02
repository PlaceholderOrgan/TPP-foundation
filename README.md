# redesigned-guacamole

This project is a full-stack application with a React front-end and an Express/SQLite back-end.

## Prerequisites

- Node.js (v14 or later)
- npm

## Project Structure

- **Frontend:**  
  The React application is located in the root of the project. It uses CRACO for configuration.  
  See [package.json](package.json) for the available front-end scripts and dependencies.

- **Backend:**  
  The Express server with a SQLite database is located in the `backend/` folder.  
  See [backend/package.json](backend/package.json) for the back-end scripts and dependencies.

## Setup & Installation

1. **Clone the repository.**

2. **Install dependencies for the front-end:**

   ```sh
   npm install
   ```
3. **Install dependencies for the back-end:**

```sh
cd backend
npm install
cd ..
```

## Running the project

1. **Run Both Front-end and Back-end Together**
Run the following command from the root directory. This uses concurrently to start both the React development server and the backend server:

```sh
npm run dev
```

2. **Run the Front-end Only**
Start only the React application with:
```sh
npm start
```

3. **Run the Back-end Only**
Start only the Express server with:
```sh
npm run server
```

The front-end proxies API calls to http://localhost:5000 as defined in package.json.

## Building for Production
To create an optimized production build for the front-end, run:
```sh
npm run build
```
## Additional Notes
- The back-end uses an SQLite database (users.db) to store user information.
- The front-end includes pages for Home, Forum, and user authentication (Login and Register).
- Will add more as needed.

# Happy coding!