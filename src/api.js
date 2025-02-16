import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if ((error.response && error.response.status === 403) || (error.response && error.response.status === 401)) {
      try {
        const { data } = await API.post("/refresh", {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem("refreshToken")}` }
          });
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

export const loginOrSignup = async (email, password) => {
    try {
        const { data } = await API.post("/auth", { email, password });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
        return data;
    } catch (error) {
        console.error("Login failed", error);
    }
}

export const logout = async () => {
  await API.post("/logout");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const fetchTrades = async (type="all") => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await API.get(`/trades?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data;
    } catch (error) {
      console.error("Error fetching trades", error);
    }
  };
  
export const handleAddTrade = async (data) => {
    try {
      const token = localStorage.getItem("accessToken");
      await API.post("/trades", data, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
    return fetchTrades();
    } catch (error) {
      console.error("Error adding trade", error);
    }
};
