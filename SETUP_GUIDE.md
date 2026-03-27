# ArguMind Authentication System - Setup Guide

This guide explains how to set up MongoDB Atlas, configure your environment variables, and run the complete ArguMind Authentication System.

## 1. MongoDB Atlas Setup

### Create a Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account or sign in.
2. Click on **Build a Database** and select the **Shared (Free)** tier.
3. Choose a cloud provider and region (leave defaults if unsure) and click **Create Cluster**.

### Create Database User
1. Under **Security** in the left sidebar, click **Database Access**.
2. Click **Add New Database User**.
3. Set an **Authentication Method** (usually Password).
4. Enter a **Username** and **Password** (save these for later).
5. Make sure the user has `Read and write to any database` privileges.
6. Click **Add User**.

### Configure Network Access (IP Whitelist)
1. Under **Security** in the left sidebar, click **Network Access**.
2. Click **Add IP Address**.
3. Select **Allow Access from Anywhere** (adds `0.0.0.0/0`) or add your current IP address.
4. Click **Confirm**.

### Get the Connection String
1. Go back to your dashboard (click **Database** under Deployment).
2. Click the **Connect** button on your cluster.
3. Select **Drivers** (Connect to your application).
4. Do not copy the code, just copy the connection string. It will look like this:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<password>` with the password you created in the Database Access step.
6. (Optional) Add a database name before the `?`, e.g., `...mongodb.net/argumind?retryWrites...`

---

## 2. Environment Variables Configuration

In your backend folder (`server/`), locate the `.env` file (or create one using the `.env.example` template) and update the values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/argumind?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string_here_like_argumind_super_secret_key_2023
```

---

## 3. Running the Project

You will need two separate terminal windows to run both the backend and frontend simultaneously.

### Running the Backend

Open Terminal 1 and navigate to the backend directory:
```bash
cd d:/Projects/ArguMind/server
npm install
npm run dev
```
The server should start on `http://localhost:5000` and display `MongoDB Connected`.

### Running the Frontend

Open Terminal 2 and navigate to the frontend directory:
```bash
cd d:/Projects/ArguMind/client
npm install
npm run dev
```
*(Note: We are using Vite instead of Create React App, so the command is `npm run dev` rather than `npm start`)*

The frontend will start typically on `http://localhost:5173`. Open this URL in your browser.

---

## 4. Testing the Authentication

1. Open your browser and go to the frontend URL (e.g., `http://localhost:5173`).
2. You will be redirected to `/login`.
3. Click on **Create an account** to go to `/signup`.
4. Register a new user with Name, Email, and Password.
5. If successful, you will be automatically redirected to the `/dashboard`.
6. You can verify the user was created by checking your MongoDB Atlas **Collections** tab.
7. To test login, refresh the page, go to `/login`, and enter the credentials you just created.
