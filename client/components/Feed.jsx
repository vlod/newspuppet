import React from 'react';
import FeedItem from './FeedItem';

const Feed = (props) => {
  const { feed } = props;
  return (
    <div className="feed">
      <h3>{feed.name}</h3>
      <div className="articles">
        <ul>
        {feed.articles.map((article) =>
          <FeedItem
            key={article.id} id={article.id}
            link={article.link}
            title={article.title}
            comments={article.comments}
            feedHash={feed.hash}
          />
        )}
        </ul>
      </div>
    </div>
  );
};
Feed.propTypes = {
  feed: React.PropTypes.object.isRequired,
  snippetHandler: React.PropTypes.func,
};

export default Feed;
