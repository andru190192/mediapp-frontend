import axios from 'axios';
import { URL_BASE } from '../environments/env.json';

export const getExamsWS = async () => await axios.get(`${URL_BASE}/exams`);

export const saveExamWS = async (exam) => await axios.post(`${URL_BASE}/exams`, exam);

export const updateExamWS = async (exam) => await axios.put(`${URL_BASE}/exams`, exam);

export const deleteExamWS = async (exam) => await axios.delete(`${URL_BASE}/exams/${exam.id}`);