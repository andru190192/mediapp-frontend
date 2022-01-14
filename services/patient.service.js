import axios from 'axios';
import { URL_BASE } from '../environments/env.json';

export const getPatientWS = async () => {
  try {
    return await axios.get(`${URL_BASE}/patients`);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}

export const savePatientWS = async (patient) => {
  try {
    return await axios.post(`${URL_BASE}/patients`, patient);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}

export const updatePatientWS = async (patient) => {
  try {
    console.log('patient update', patient);
    return await axios.put(`${URL_BASE}/patients`, patient);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}

export const deletePatientWS = async (patient) => {
  try {
    return await axios.delete(`${URL_BASE}/patients/${patient.id}`);
  } catch (error) {
    console.log(error);
    return Promise.reject({
      statusCode: (error.response && error.response.status) || 404,
    });
  }
}