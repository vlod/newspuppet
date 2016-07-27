import { FETCH_CATEGORY } from '../actions/index';

export default function selectedCategory(state = [], action) {
  switch (action.type) {
    case FETCH_CATEGORY:
      console.log('FETCH_CATEGORY returned');
      return action.payload.data.results;

    default:
      return state;
  }
}
