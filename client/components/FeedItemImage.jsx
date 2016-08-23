import React from 'react';

const FeedItemImage = (props) => {
  const { id, link, title, image_url } = props;
  return (
    <li key={id} className="feedItemImage">
      <a target="_blank" href={link}><img alt={title} title={title} src={image_url} /></a>
    </li>
  );
};
FeedItemImage.propTypes = {
  id: React.PropTypes.string.isRequired,
  link: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  image_url: React.PropTypes.string,
};

export default FeedItemImage;
