import axios from 'axios';
import { URL_BASE } from '../environments/env.json';

export const getDoctorsWS = async () => {
  try {
    return await axios.get(`${URL_BASE}/doctors`);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}

export const saveDoctorWS = async (specialty) => {
  try {
    return await axios.post(`${URL_BASE}/doctors`, specialty);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      ...response,
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}

export const updateDoctorWS = async (specialty) => {
  try {
    console.log('specialty update', specialty);
    return await axios.put(`${URL_BASE}/doctors`, specialty);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      ...response,
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}

export const deleteDoctorWS = async (specialty) => {
  try {
    return await axios.delete(`${URL_BASE}/doctors/${specialty.id}`);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}