import axios from 'axios';
import { URL_BASE } from '../environments/env.json';

export const savePersonWS = async (person) => {
  try {
    return await axios.post(`${URL_BASE}/register`, person);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}