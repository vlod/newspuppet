import { combineReducers } from 'redux';
import categories from './reducer_categories';
import selectedCategory from './reducer_category';

const rootReducer = combineReducers({
  categories,
  selectedCategory,
});

export default rootReducer;
