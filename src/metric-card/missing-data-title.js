import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

/**
 * A title that displays a list of missing stream data
 */
export default class MissingDataTitle extends PureComponent {
  static propTypes = {
    missingData: PropTypes.string
  };

  static defaultProps = {
    missingData: ""
  };

  render() {
    return (
      <div style={{ color: "red", padding: "10px 0", maxWidth: '100%', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
          Missing Data: {this.props.missingData}
      </div>
    )
  }
}
