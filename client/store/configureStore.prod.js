import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';
import reducers from '../reducers';

const enhancer = applyMiddleware(promise);

export default function configureStore(initialState) {
  return createStore(reducers, initialState, enhancer);
}
