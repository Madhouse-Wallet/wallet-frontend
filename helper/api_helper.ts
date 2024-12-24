import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "react-toastify";

// Apply base URL for axios
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_URL = API_BASE_URL + (process.env.NEXT_PUBLIC_API_BASE_URL_EXTENSION || "");
export const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const axiosApi = axios.create({
  baseURL: API_URL + API_VERSION,
});

export const updateToken = (token: string = "") => {
  axiosApi.defaults.headers.common["Authorization"] = "Bearer " + token;
};

// Fetch token from localStorage on the client side
let token: string | null = null;

if (typeof window !== "undefined") {
  token = localStorage.getItem("authToken");
}

export const setAuthInfo = (token: string | null = null, userData: object | null = null) => {
  if (userData) {
    localStorage.setItem("authUser", JSON.stringify(userData));
  } else {
    localStorage.removeItem("authUser");
  }

  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
  
  updateToken(token || "");
};

updateToken(token || "");

// Axios response interceptor
axiosApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error)
);

// Logout function
export const LogoutUser = (type: boolean = false) => {
  if (!type) {
    toast.error("Please Log In!");
  }
  localStorage.removeItem("authUser");
  localStorage.clear();
  window.location.replace("/login");
};

// Get Authorization headers
const getConfig = (): AxiosRequestConfig => {
  let token: string | null = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("authToken");
  }
  return {
    headers: {
      Authorization: "Bearer " + token,
    },
  };
};

// Status code checker
const checkStatusCode = (code: number | null, err: any) => {
  if (code && [403, 500, 501, 502, 503, 401, 400].includes(code)) {
    if (code === 401) {
      LogoutUser();
      throw new Error(err.response?.data?.message);
    } else {
      throw new Error(err.response?.data?.message);
    }
  } else {
    throw new Error(err?.response?.data?.message || err.message || err);
  }
};

// Get request
export async function get(url: string, config: AxiosRequestConfig = {}): Promise<any> {
  return await axiosApi
    .get(url, { ...config, ...getConfig() })
    .then((response) => {
      if (response.data.status === "success") {
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    })
    .catch((e) => {
      checkStatusCode(!e.response ? null : e.response.status, e);
    });
}

// Post request
export async function post(url: string, data: any, config: AxiosRequestConfig = {}): Promise<any> {
  return await axiosApi
    .post(url, data, { ...config, ...getConfig() })
    .then((response) => {
      if (response.data.status === "success") {
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    })
    .catch((e) => {
      checkStatusCode(!e.response ? null : e.response.status, e);
    });
}

// Put request
export async function put(url: string, data: any, config: AxiosRequestConfig = {}): Promise<any> {
  return axiosApi
    .put(url, { ...data }, { ...config, ...getConfig() })
    .then((response) => {
      if (response.data.status === "success") {
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    })
    .catch((e) => {
      checkStatusCode(!e.response ? null : e.response.status, e);
    });
}

// Delete request
export async function del(url: string, config: AxiosRequestConfig = {}): Promise<any> {
  return await axiosApi
    .delete(url, { ...config, ...getConfig() })
    .then((response) => {
      if (response.data.status === "success") {
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    })
    .catch((e) => {
      checkStatusCode(!e.response ? null : e.response.status, e);
    });
}
