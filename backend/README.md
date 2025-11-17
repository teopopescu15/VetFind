# Backend API

Node.js backend with TypeScript, Express.js, and PostgreSQL (to be configured).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the TypeScript code to JavaScript
- `npm run start` - Start the production server (requires build)
- `npm run build:clean` - Clean build directory and rebuild
- `npm run watch` - Watch TypeScript files for changes
- `npm run lint` - Lint the code
- `npm run lint:fix` - Fix linting issues

## Project Structure

```
backend/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Express middleware
│   ├── models/        # Database models (for PostgreSQL)
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── app.ts         # Express app setup
│   └── server.ts      # Server entry point
├── dist/              # Compiled JavaScript (generated)
├── .env               # Environment variables (not in git)
├── .env.example       # Environment variables template
├── .gitignore        # Git ignore file
├── nodemon.json      # Nodemon configuration
├── package.json      # Dependencies and scripts
└── tsconfig.json     # TypeScript configuration
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### API Info
- `GET /api` - API information

### Sample Routes (example)
- `GET /api/sample` - Get all items
- `GET /api/sample/:id` - Get item by ID
- `POST /api/sample` - Create new item
- `PUT /api/sample/:id` - Update item
- `DELETE /api/sample/:id` - Delete item

## Database Setup

PostgreSQL configuration will be added in the next step. The database configuration file is already prepared at `src/config/database.ts`.

## Development

The server runs on port 5000 by default (configurable via `PORT` environment variable).

To start development:
```bash
npm run dev
```

The server will automatically restart when you make changes to TypeScript files.