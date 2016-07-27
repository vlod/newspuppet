import { createStore, applyMiddleware, compose } from 'redux';
// import { persistState } from 'redux-devtools';
import promise from 'redux-promise';
import reducers from '../reducers';

export default function configureStore(initialState) {
  const store = createStore(reducers, initialState, compose(
    applyMiddleware(promise),
     window.devToolsExtension ? window.devToolsExtension() : f => f
  ));

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
