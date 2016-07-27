import { FETCH_CATEGORIES } from '../actions/index';

export default function categories(state = [], action) {
  switch (action.type) {
    case FETCH_CATEGORIES:
      console.log('FETCH_CATEGORIES returned');
      return [...action.payload.data];

    default:
      return state;
  }
}
