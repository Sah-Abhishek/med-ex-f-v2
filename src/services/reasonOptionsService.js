import axios from 'axios';
import { MEDX_API_URL } from '../utils/constants';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const REASON_CATEGORIES = [
  { key: 'admit_code', label: 'Admit Code' },
  { key: 'primary_diagnosis', label: 'Primary Diagnosis' },
  { key: 'secondary_diagnosis', label: 'Secondary Diagnosis' },
  { key: 'cpt', label: 'CPT / Procedure' },
  { key: 'em_level', label: 'ED E/M Level' },
  { key: 'modifier', label: 'Modifier' },
];

export const REASON_ACTIONS = [
  { key: 'add', label: 'Add' },
  { key: 'edit', label: 'Edit' },
  { key: 'reject', label: 'Reject' },
];

export async function listReasonOptions() {
  const res = await axios.get(`${MEDX_API_URL}/reason-options`, { headers: authHeaders() });
  return res.data.options || [];
}

export async function createReasonOption({ category, action, label }) {
  const res = await axios.post(
    `${MEDX_API_URL}/reason-options`,
    { category, action, label },
    { headers: authHeaders() }
  );
  return res.data.option;
}

export async function deleteReasonOption(id) {
  const res = await axios.delete(`${MEDX_API_URL}/reason-options/${id}`, { headers: authHeaders() });
  return res.data;
}
