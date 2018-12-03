import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import AutoSizer from '../shared/autosizer';
import Slider from '../shared/slider';
import {getTimelineTicks, formatTimeCode} from './utils';
import {scaleLinear} from 'd3-scale';

import {withTheme} from '../shared/theme';

import {
  WrapperComponent,
  ControlsContainer,
  PlayPauseButton,
  Timestamp,
  TicksContainer,
  Tick,
  TickLabel,
  MarkersContainer,
  MarkerComponent,
  BufferComponent
} from './styled-components.js';
import {PlayIcon, PauseIcon} from './icons';

const LAYOUT = {
  COMPACT: 0,
  NORMAL: 1
};

const DEFAULT_PADDING = 24;
const COMPACT_CONTAINER_STYLE = {display: 'flex', alignItems: 'flex-end'};

function noop() {}

function normalizePadding(padding) {
  padding = padding || 0;
  if (Number.isFinite(padding)) {
    return {right: padding, left: padding};
  }
  return Object.assign(
    {
      right: 0,
      left: 0
    },
    padding
  );
}

/*
 * @class
 */
class PlaybackControl extends PureComponent {
  static propTypes = {
    style: PropTypes.object,
    layout: PropTypes.oneOf([LAYOUT.COMPACT, LAYOUT.NORMAL]),

    currentTime: PropTypes.number.isRequired,
    startTime: PropTypes.number,
    endTime: PropTypes.number.isRequired,
    isPlaying: PropTypes.bool.isRequired,
    className: PropTypes.string,

    // config
    step: PropTypes.number,
    padding: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    tickSpacing: PropTypes.number,
    bufferRange: PropTypes.arrayOf(PropTypes.object),
    markers: PropTypes.arrayOf(PropTypes.object),

    // callbacks
    formatTick: PropTypes.func,
    formatTimestamp: PropTypes.func,
    onPlay: PropTypes.func,
    onPause: PropTypes.func,
    onSeek: PropTypes.func
  };

  static defaultProps = {
    style: {},
    layout: LAYOUT.NORMAL,

    className: '',
    startTime: 0,
    step: 0.1,
    padding: 24,
    tickSpacing: 100,
    formatTick: x => formatTimeCode(x, '{mm}:{ss}'),
    formatTimestamp: x => formatTimeCode(x, '{mm}:{ss}.{S}'),
    onPlay: noop,
    onPause: noop,
    onSeek: noop
  };

  constructor(props) {
    super(props);
    this.scale = scaleLinear().domain([props.startTime, props.endTime]);
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    const props = this.props;

    if (
      newProps.step !== props.step ||
      newProps.startTime !== props.startTime ||
      newProps.endTime !== props.endTime
    ) {
      // Video source has changed
      // Kill any running animation to avoid callbacks in incorrect time range
      this._pause();
      // Update currentTime to make sure it is the start of the new range
      this._seek(newProps.startTime);
      this.scale.domain([newProps.startTime, newProps.endTime]);
    }
  }

  componentWillUnmount() {
    this._pause();
  }

  _play = () => {
    this.props.onPlay();
  };

  _pause = () => {
    this.props.onPause();
  };

  _seek = newTime => {
    const {currentTime} = this.props;

    if (newTime !== currentTime) {
      this.props.onSeek(newTime);
    }
  };

  _onResize = ({width}) => {
    const padding = normalizePadding(this.props.padding);
    this.scale.range([0, width - padding.left - padding.right]);
    // Trigger rerender
    this.setState({width});
  };

  _renderMarker(marker, i, Component, styleProps, userStyle) {
    const {scale} = this;
    const {startTime = marker.time, endTime = marker.time, style, content} = marker;
    const x0 = scale(startTime);
    const x1 = scale(endTime);

    const markerStyle = {
      ...style,
      position: 'absolute',
      left: x0,
      width: x1 - x0
    };

    return (
      <Component key={i} {...styleProps} style={markerStyle} userStyle={userStyle}>
        {content}
      </Component>
    );
  }

  _renderTimeline(styleProps) {
    const {style, tickSpacing, formatTick, markers} = this.props;
    const {scale} = this;
    const ticks = getTimelineTicks(scale, tickSpacing, formatTick);

    return (
      <div>
        <TicksContainer {...styleProps} userStyle={style.ticks}>
          {ticks.map((t, i) => {
            const tickStyle = {
              position: 'absolute',
              left: t.x
            };
            return (
              <Tick key={i} {...styleProps} userStyle={style.tick} style={tickStyle}>
                <TickLabel {...styleProps} userStyle={style.tickLabel}>
                  {t.label}
                </TickLabel>
              </Tick>
            );
          })}
        </TicksContainer>

        {markers && (
          <MarkersContainer {...styleProps} userStyle={style.markers}>
            {markers.map((marker, i) =>
              this._renderMarker(marker, i, MarkerComponent, styleProps, style.marker)
            )}
          </MarkersContainer>
        )}
      </div>
    );
  }

  _renderSlider(styleProps) {
    const {style, currentTime, startTime, endTime, step, bufferRange = []} = this.props;

    const buffers = Array.isArray(bufferRange) ? bufferRange : [bufferRange];

    return (
      <Slider
        style={style.slider}
        value={currentTime}
        onChange={this._seek}
        knobSize={18}
        step={step}
        min={startTime}
        max={endTime}
      >
        {buffers.map((range, i) =>
          this._renderMarker(range, i, BufferComponent, styleProps, style.buffer)
        )}
      </Slider>
    );
  }

  _renderPlayPauseButton(styleProps) {
    const {isPlaying, style} = this.props;

    return (
      <PlayPauseButton
        {...styleProps}
        userStyle={style.playPauseButton}
        onClick={isPlaying ? this._pause : this._play}
      >
        {isPlaying ? style.pauseIcon || <PauseIcon /> : style.playIcon || <PlayIcon />}
      </PlayPauseButton>
    );
  }

  _renderTimestamp(styleProps) {
    const {style, currentTime, formatTimestamp} = this.props;
    return (
      <Timestamp {...styleProps} userStyle={style.timestamp}>
        {formatTimestamp(currentTime)}
      </Timestamp>
    );
  }

  render() {
    const {theme, layout, style, className, isPlaying} = this.props;

    let {padding = DEFAULT_PADDING} = style;
    padding = normalizePadding(padding);

    const styleProps = {
      theme,
      layout,
      isPlaying
    };

    const wrapperStyle = {
      width: style.width || '100%'
    };

    if (layout === LAYOUT.COMPACT) {
      const sliderStyle = {
        flexGrow: 1,
        paddingLeft: padding.left,
        paddingRight: padding.right
      };

      return (
        <WrapperComponent
          className={className}
          {...styleProps}
          userStyle={style.wrapper}
          style={wrapperStyle}
        >
          <div style={COMPACT_CONTAINER_STYLE}>
            {this._renderPlayPauseButton(styleProps)}
            <div style={sliderStyle}>
              <AutoSizer disableHeight={true} onResize={this._onResize} />
              {this._renderTimeline(styleProps)}
              {this._renderSlider(styleProps)}
            </div>
            {this._renderTimestamp(styleProps)}
          </div>

          <ControlsContainer {...styleProps} userStyle={style.controls}>
            {this.props.children}
          </ControlsContainer>
        </WrapperComponent>
      );
    }

    Object.assign(wrapperStyle, {
      paddingLeft: padding.left,
      paddingRight: padding.right
    });

    return (
      <WrapperComponent
        className={className}
        {...styleProps}
        userStyle={style.wrapper}
        style={wrapperStyle}
      >
        <AutoSizer disableHeight={true} onResize={this._onResize} />
        {this._renderTimeline(styleProps)}
        {this._renderSlider(styleProps)}

        <ControlsContainer {...styleProps} userStyle={style.controls}>
          {this._renderPlayPauseButton(styleProps)}
          {this._renderTimestamp(styleProps)}
          {this.props.children}
        </ControlsContainer>
      </WrapperComponent>
    );
  }
}

const ThemedPlaybackControl = withTheme(PlaybackControl);
ThemedPlaybackControl.formatTimeCode = formatTimeCode;
Object.assign(ThemedPlaybackControl, LAYOUT);

export default ThemedPlaybackControl;
