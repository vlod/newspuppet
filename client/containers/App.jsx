import React from 'react';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/Navbar';

import { connect } from 'react-redux';
import { fetchCategories } from '../actions/index';

class AppContainer extends React.Component {
  componentWillMount() {
    console.log('AppContainer componentWillMount(): fetching catgories');
    this.props.fetchCategories();
  }
  render() {
    return (
      <div>
        <NavBar categories={this.props.categories || []} />
        <Sidebar categories={this.props.categories || []} />

        <div className="mainContent">
          {this.props.content}
        </div>
      </div>
    );
  }
}

AppContainer.propTypes = {
  content: React.PropTypes.node.isRequired,
  categories: React.PropTypes.array.isRequired,
  fetchCategories: React.PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return { categories: state.categories };
}

export default connect(mapStateToProps, { fetchCategories })(AppContainer);
