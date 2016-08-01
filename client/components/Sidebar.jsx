import React from 'react';
import { Link } from 'react-router';

require('../css/sidebar.scss');

const ACTIVE = { backgroundColor: 'green', color: 'white' };

const Sidebar = (props) => {
  if (!props.categories) {
    return <div></div>;
  }

  return (
    <div className="sidebar hidden-xs">
      <ul className="nav nav-sidebar">
        {props.categories.map(
            (category) => <li key={category.id} className="entry">
              <Link to={`/category/${category.id}`} activeStyle={ACTIVE}>
                <span className="title hidden-xs">{category.name}</span>
              </Link>
            </li>
        )}
      </ul>
    </div>
  );
};

Sidebar.propTypes = {
  categories: React.PropTypes.array.isRequired,
};

export default Sidebar;
