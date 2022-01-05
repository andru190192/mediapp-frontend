import axios from 'axios';
import { URL_BASE } from '../environments/env.json';

export const getSpecialtiesWS = async () => {
  try {
    return await axios.get(`${URL_BASE}/specialties`);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}

export const saveSpecialtyWS = async (specialty) => {
  try {
    return await axios.post(`${URL_BASE}/specialties`, specialty);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      ...response,
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}

export const updateSpecialtyWS = async (specialty) => {
  try {
    console.log('specialty update', specialty);
    return await axios.put(`${URL_BASE}/specialties`, specialty);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      ...response,
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}

export const deleteSpecialtyWS = async (specialty) => {
  try {
    return await axios.delete(`${URL_BASE}/specialties/${specialty.id}`);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}