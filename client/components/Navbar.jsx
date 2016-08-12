import React from 'react';
import { Link } from 'react-router';

const ACTIVE = { backgroundColor: 'green', color: 'white' };

const Navbar = (props) => {
  return (
    <nav className="navbar navbar-inverse navbar-fixed-top">
      <div className="container-fluid">
        <div className="navbar-header">
          <button
            type="button" className="navbar-toggle collapsed"
            data-toggle="collapse" data-target="#navbar"
            aria-expanded="false" aria-controls="navbar"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link to="/" className="navbar-brand">Newspuppet</Link>
        </div>
        <div className="visible-xs-block">
          <div id="navbar" className="navbar-collapse collapse top-menu">
            <ul className="nav navbar-nav navbar-right">
              {props.categories.map(
                (category) => <li key={category.id}>
                  <Link to={`/category/${category.id}`} activeStyle={ACTIVE}>
                    <span className="title">{category.name}</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  categories: React.PropTypes.array.isRequired,
};

export default Navbar;
