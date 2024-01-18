import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { baseURL } from "../constants";

const axiosClient = axios.create({
    baseURL,
    timeout: 1000,
});

axiosClient.interceptors.request.use(function (config) {
    const token = JSON.parse(localStorage.getItem('authdata'));
    let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    config.headers.Authorization = token ? `Basic ${token}` : '';
    config.headers['X-CSRFToken'] = cookieValue ? cookieValue : '';
    return config;
});

const useFetch = (url, method = "GET", body) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiData, setApiData] = useState(null);
    const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await axiosClient({ method, url, data: body });
      const data = await resp?.data;
      setApiData(data);
      setIsLoading(false);
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }
  }, [method, url, body]);

  useEffect(() => {
    fetchData();
  }, [url, method]);

  return { isLoading, apiData, error, fetchData };
};

const triggerFetchData = async (url, body, method = "POST") => {
    let data = null;
    try {
        const resp = await axiosClient({
            method: method,
            url: url,
            data: body
        });
        data = resp?.data;
        console.log({ data });
        return data;
    } catch (error) {
        console.log(error);
    }
};



const LoginAPI = async ({ username, password }) => {
    const options = {
        headers: {
            "Authorization": "Basic " + window.btoa(username + ':' + password)
        }
    };

    try {
        return await axios.post('login/', {}, options)
    } catch (error) {
        return error
    }
}

const LogoutAPI = async () => {
    try {
        return await axios.post('logout/', {})
    } catch (error) {
        return error
    }
}

export { useFetch, triggerFetchData, LoginAPI, LogoutAPI };
