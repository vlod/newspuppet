/* eslint-disable max-len */
import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './containers/App';
// import Sidebar from './components/Sidebar';
import Home from './components/Home';
import CategoryContainer from './containers/Category';

export default (
  <Route path="/" component={App}>
    <IndexRoute components={{ content: Home }} />
    <Route path="/home" components={{ content: Home }} />
    <Route path="/category/:id" components={{ content: CategoryContainer }} />
  </Route>
);
