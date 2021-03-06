import axios from 'axios';

export const FETCH_CATEGORIES = 'FETCH_CATEGORIES';
export const FETCH_CATEGORY = 'FETCH_CATEGORY';

export function fetchCategories() {
  const request = axios.get('/categories/index.json');

  return {
    type: FETCH_CATEGORIES,
    payload: request,
  };
}

export function fetchCategory(id) {
  const request = axios.get(`/categories/${id}.json`);

  return {
    type: FETCH_CATEGORY,
    payload: request,
  };
}

