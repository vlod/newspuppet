/* global expect */
import React from 'react';
import { shallow } from 'enzyme';

import Feed from '../../client/components/Feed';

describe('<Feed />', () => {
  it.only('renders feed icon correctly', () => {
    const wrapper = shallow(
      <Feed
        key="2"
        feed={{
          hash: '8b5c4e439324d2ea64ce8bca9976a35b',
          name: 'BBC news',
          site_url: 'http://www.bbc.com/news',
          type: 'TEXT',
          articles: [] }}
      />);
    const icon = wrapper.find('img.feedIcon');
    expect(icon).to.have.length(1);
    expect(icon.props().src).to.equal('/favicons/8b5c4e439324d2ea64ce8bca9976a35b.png');
  });
});
