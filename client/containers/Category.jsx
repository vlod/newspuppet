import React from 'react';
import { connect } from 'react-redux';
import { fetchCategory } from '../actions/index';

import Category from '../components/Category';


class CategoryContainer extends React.Component {
  componentWillMount() {
    this.props.fetchCategory(this.props.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.id !== nextProps.params.id) {
      this.props.fetchCategory(nextProps.params.id);
    }
  }

  render() {
    return <Category categoryId={this.props.params.id} values={this.props.selectedCategory} />;
  }
}

function mapStateToProps(state) {
  return { selectedCategory: state.selectedCategory };
}

export default connect(mapStateToProps, { fetchCategory })(CategoryContainer);
