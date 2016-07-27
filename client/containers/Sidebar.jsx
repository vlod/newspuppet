import React from 'react';
import { connect } from 'react-redux';
import { fetchCategories } from '../actions/index';

import Sidebar from '../components/Sidebar';


class SidebarContainer extends React.Component {
  componentWillMount() {
    console.log('SidebarContainer componentWillMount(): fetching catgories');
    this.props.fetchCategories();
  }

  render() {
    return <Sidebar categories={this.props.categories || []} />;
  }
}

function mapStateToProps(state) {
  // whatever is returned will show up as props inside of Container
  return { categories: state.categories };
}

export default connect(mapStateToProps, { fetchCategories })(SidebarContainer);
