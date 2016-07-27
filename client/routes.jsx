/* eslint-disable max-len */
import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './components/App';
import SidebarContainer from './containers/Sidebar';
import Home from './components/Home';
import CategoryContainer from './containers/Category';

export default (
  <Route path="/" component={App}>
    <IndexRoute components={{ content: Home, sidebar: SidebarContainer }} />
    <Route path="/home" components={{ content: Home, sidebar: SidebarContainer }} />
    <Route path="/category/:id" components={{ content: CategoryContainer, sidebar: SidebarContainer }} />
  </Route>
);

