# Stock Trading App - Frontend

This is the frontend of the Stock Trading Application built using **React.js**, **Axios**, and **Ant Design**.

## Features
- User authentication (Login & Signup)
- Trade management (Add, View, Filter Trades)
- Auto-refresh access tokens using refresh tokens
- Responsive UI

## Tech Stack
- **React.js** - Frontend framework
- **Axios** - API requests
- **React Router** - Navigation
- **Ant Design** - UI components
- **Local Storage** - Token storage

---

## Installation & Setup

### Prerequisites
Make sure you have **Node.js** and **npm** installed on your system.

### Clone the Repository
```sh
git clone https://github.com/your-repo/frontend.git
```

### Install Dependencies
```sh
npm install
```

### Start the Development Server
```sh
npm start
```

This will start the React app on **http://localhost:3000/**.

---

## API Configuration
The frontend interacts with the backend APIs using Axios. Ensure that the backend is running at **http://localhost:5000/api**.

### Axios API Setup (`src/api.js`)
```js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 403) {
      try {
        const { data } = await API.post("/refresh");
        localStorage.setItem("accessToken", data.accessToken);
        error.config.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return axios(error.config);
      } catch (err) {
        console.error("Session expired, please login again.");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
```

---

## Available API Functions

### User Authentication
```js
export const loginOrSignup = async (email, password) => {
  try {
    const { data } = await API.post("/auth", { email, password });
    localStorage.setItem("accessToken", data.accessToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
    return data;
  } catch (error) {
    console.error("Login failed", error);
  }
};

export const logout = async () => {
  await API.post("/logout");
  localStorage.removeItem("accessToken");
};
```

### Fetch Trades
```js
export const fetchTrades = async (type="all") => {
  try {
    const token = localStorage.getItem("accessToken");
    const { data } = await API.get(`/trades?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.data;
  } catch (error) {
    console.error("Error fetching trades", error);
    await API.post("/logout");
    localStorage.removeItem("accessToken");
    window.location.reload();
  }
};
```

### Add Trade
```js
export const handleAddTrade = async (data) => {
  try {
    const token = localStorage.getItem("accessToken");
    await API.post("/trades", data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return fetchTrades();
  } catch (error) {
    console.error("Error adding trade", error);
    await API.post("/logout");
    localStorage.removeItem("accessToken");
    window.location.reload();
  }
};
```

---

## Running Tests
To run unit tests for the frontend:
```sh
npm test
```

---

## Deployment
To build and deploy the project:
```sh
npm run build
```
The production-ready build will be in the `build` directory.

---

## License
This project is licensed under the **MIT License**.

---

## Author
Developed by **Shivang Srivastava** 🚀

