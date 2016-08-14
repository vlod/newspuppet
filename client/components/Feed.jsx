import React from 'react';
import FeedItem from './FeedItem';
import FeedItemImage from './FeedItemImage';

function ItemSelector(feed, article) {
  if (feed.type === 'TEXT') {
    return (
      <FeedItem
        key={article.id} id={article.id}
        link={article.link}
        title={article.title}
        comments={article.comments}
        feedHash={feed.hash}
      />
    );
  }
  else if (feed.type === 'IMAGE') {
    return (
      <FeedItemImage
        key={article.id} id={article.id}
        link={article.link}
        title={article.title}
        image_url={article.image_url}
        feedHash={feed.hash}
      />
    );
  }
}
const Feed = (props) => {
  const { feed } = props;
  return (
    <div className="feed">
      <h3>
        <a target="_blank" href={feed.site_url}><img src={feed.icon} width="26" height="26" alt="icon" className="feedIcon" />{feed.name}</a>
      </h3>
      <div className="articles">
        <ul>
        {feed.articles.map((article) => ItemSelector(feed, article))}
        </ul>
      </div>
      <div className="clearfix" />
    </div>
  );
};
Feed.propTypes = {
  feed: React.PropTypes.object.isRequired,
  snippetHandler: React.PropTypes.func,
};

export default Feed;
