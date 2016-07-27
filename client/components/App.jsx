import React from 'react';
import NavBar from './Navbar';

export default function App(props) {
  return (
    <div>
      <NavBar />
      {props.sidebar}

      <div className="mainContent">
        {props.content}
      </div>
    </div>
  );
}

App.propTypes = {
  sidebar: React.PropTypes.node.isRequired,
  content: React.PropTypes.node.isRequired,
};
