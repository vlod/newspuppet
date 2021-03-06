import React from 'react';
import Feed from './Feed';

require('../css/category.scss');

const Category = (props) => {
  if (!props.values) {
    return <div></div>;
  }
  return (
    <div className="category_page">
      <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <ul>
        {props.values.map((feed) => <Feed key={feed.id} feed={feed} snippetHandler={props.snippetHandler} />)}
        </ul>
      </div>
    </div>
  );
};

Category.propTypes = {
  categoryId: React.PropTypes.string.isRequired,
  values: React.PropTypes.array.isRequired,
  snippetHandler: React.PropTypes.func,
  snippet: React.PropTypes.string,
};


export default Category;
