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

export const saveDoctorWS = async (doctor) => {
  try {
    console.log('doctor save', doctor);
    return await axios.post(`${URL_BASE}/doctors`, doctor);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}

export const updateDoctorWS = async (doctor) => {
  try {
    console.log('doctor update', doctor);
    return await axios.put(`${URL_BASE}/doctors`, doctor);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}

export const deleteDoctorWS = async (doctor) => {
  try {
    return await axios.delete(`${URL_BASE}/doctors/${doctor.id}`);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}