import axios from 'axios';
import { URL_BASE } from '../environments/env.json';

export const loginWS = async (request) =>  await axios.post(`${URL_BASE}/login`, request);