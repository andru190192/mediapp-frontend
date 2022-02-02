import axios from 'axios';
import { URL_BASE } from '../environments/env.json';

export const getMedicineWS = async () => await axios.get(`${URL_BASE}/medicines`);

export const saveMedicineWS = async (medicine) => await axios.post(`${URL_BASE}/medicines`, medicine);

export const updateMedicineWS = async (medicine) => await axios.put(`${URL_BASE}/medicines`, medicine);

export const deleteMedicineWS = async (medicine) => await axios.delete(`${URL_BASE}/medicines/${medicine.id}`);