import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Spinner from '../shared/spinner';
import {Tooltip} from '../shared/popover';

import {withTheme} from '../shared/theme';
import {CardContainer, CardTitle, ErrorMessage} from './styled-components';
import MissingDataTitle from './missing-data-title';

const MissingData = props => {
  const {style, missingData} = props;
  const missingDataAsString = missingData.join(', ');

  return (
    <Tooltip style={style.tooltip} content={missingDataAsString}>
      <MissingDataTitle missingData={missingDataAsString} />
    </Tooltip>
  );
};

/**
 * MetricCard places a chart in a container with padding, title,
 * selection marker etc
 */
class MetricCard extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

    style: PropTypes.object,
    error: PropTypes.string,
    isLoading: PropTypes.bool,
    missingData: PropTypes.any,

    children: PropTypes.element
  };

  static defaultProps = {
    className: '',
    title: '',
    description: '',

    style: {},
    error: null,
    isLoading: false,
    missingData: undefined
  };

  render() {
    const {theme, style, error, isLoading, className, title, description, missingData} = this.props;
    const styleProps = {
      theme,
      hasError: Boolean(error),
      isLoading
    };

    return (
      <CardContainer className={className} {...styleProps} userStyle={style.wrapper}>
        {title && (
          <CardTitle {...styleProps} userStyle={style.title}>
            <Tooltip style={style.tooltip} content={description}>
              {title}
            </Tooltip>
          </CardTitle>
        )}

        {missingData && <MissingData style={style} missingData={missingData} />}

        {!isLoading && !error && this.props.children}
        {isLoading && <Spinner style={style.spinner} />}
        {error && (
          <ErrorMessage {...styleProps} userStyle={style.error}>
            {error}
          </ErrorMessage>
        )}
      </CardContainer>
    );
  }
}

export default withTheme(MetricCard);
