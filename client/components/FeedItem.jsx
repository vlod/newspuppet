import React from 'react';

const FeedItem = (props) => {
  const { id, link, title, comments } = props;
  return (
    <li key={id}><a target="_blank" href={link}>{title}</a>
      {comments ? <a className="comments" target="_blank" href={comments}>(comments)</a> : null}
    </li>
  );
};
FeedItem.propTypes = {
  id: React.PropTypes.string.isRequired,
  snippetHandler: React.PropTypes.func,
  link: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  comments: React.PropTypes.string,
  feedHash: React.PropTypes.string.isRequired,
};

export default FeedItem;
