# Backend Setup Instructions

## Environment Configuration

The MongoDB connection is failing because the `MONGO_URI` environment variable is not set. Follow these steps to fix it:

### 1. Create Environment File

Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/freemymail

# Server Configuration
PORT=8000
NODE_ENV=development

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Redis Configuration
REDIS_URL=redis://localhost:6379
```

### 2. MongoDB Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use: `MONGO_URI=mongodb://localhost:27017/freemymail`

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get your connection string
4. Use: `MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/freemymail`

### 3. Start the Server

After creating the `.env` file, restart the server:

```bash
npm run dev
```

The server should now connect to MongoDB successfully.

## Troubleshooting

- **"Invalid scheme" error**: Make sure your `MONGO_URI` starts with `mongodb://` or `mongodb+srv://`
- **Connection refused**: Ensure MongoDB is running locally or your Atlas cluster is accessible
- **Authentication failed**: Check your username/password in the connection string
