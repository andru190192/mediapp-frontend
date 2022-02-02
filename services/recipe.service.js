import axios from 'axios';
import { URL_BASE } from '../environments/env.json';

export const getByAppointment = async (id) => await axios.get(`${URL_BASE}/recipes/getByAppointment/${id}`);