import React from 'react';
import { connect } from 'react-redux';
import { fetchCategory } from '../actions/index';

import Category from '../components/Category';

const defaultCategory = 'home';

class HomeContainer extends React.Component {
  componentWillMount() {
    this.props.fetchCategory(defaultCategory);
  }

  render() {
    return <Category categoryId={defaultCategory} values={this.props.selectedCategory} />;
  }
}

function mapStateToProps(state) {
  return { selectedCategory: state.selectedCategory };
}

export default connect(mapStateToProps, { fetchCategory })(HomeContainer);
