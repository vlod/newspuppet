/* eslint-disable max-len */
require('./css/style.scss');

if (module.hot) module.hot.accept(); // for hot reloading

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';

import configureStore from './store/configureStore';
const store = configureStore();

import routes from './routes';

function Root() {
  return (
    <Provider store={store}>
      <Router history={browserHistory} routes={routes} onUpdate={() => window.scrollTo(0, 0)} />
    </Provider>
  );
}
ReactDOM.render(
  <Root />, document.querySelector('#app'));
