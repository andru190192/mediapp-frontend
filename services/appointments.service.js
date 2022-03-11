import axios from 'axios';
import { URL_BASE } from '../environments/env.json';

export const validateSchedulesWS = async (request) =>  {
  console.log('request', request);
  return await axios.post(`${URL_BASE}/appointments/validateSchedules`, request);
}

export const saveAppointmentWS = async (request) =>  await axios.post(`${URL_BASE}/appointments`, request);

export const updateAppointmentWS = async (request) =>  await axios.put(`${URL_BASE}/appointments`, request);

export const getByPatientAndDateAndStatus = async (request) =>  await axios.post(`${URL_BASE}/appointments/getByPatientAndDateAndStatus`, request);

export const getByDoctorAndDate = async (request) =>  await axios.post(`${URL_BASE}/appointments/getByDoctorAndDate`, request);

export const getByPatientAndStatus = async (request) =>  await axios.post(`${URL_BASE}/appointments/getByPatientAndStatus`, request);

export const getById = async (id) =>  await axios.get(`${URL_BASE}/appointments/${id}`);