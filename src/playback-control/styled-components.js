import styled from '@emotion/styled';
import {evaluateStyle} from '../shared/theme';

export const WrapperComponent = styled.div(props => {
  const result = {
    ...props.theme.__reset__,
    boxSizing: 'border-box'
  };

  if (props.isPlaying) {
    result.div = {
      transitionDuration: '0s !important'
    };
  }

  return Object.assign(result, evaluateStyle(props.userStyle, props));
});

export const ControlsContainer = styled.div(props => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: props.theme.spacingTiny,

  ...evaluateStyle(props.userStyle, props)
}));

export const PlayPauseButton = styled.div(props => ({
  width: 16,
  height: 16,
  marginLeft: props.layout === 1 ? -8 : 0,
  marginRight: props.theme.spacingSmall,
  cursor: 'pointer',
  ...evaluateStyle(props.userStyle, props)
}));

export const Timestamp = styled.div(props => ({
  ...evaluateStyle(props.userStyle, props)
}));

export const TicksContainer = styled.div(props => ({
  position: 'relative',
  height: 20,
  ...evaluateStyle(props.userStyle, props)
}));

export const Tick = styled.div(props => ({
  height: 4,
  bottom: 0,
  borderLeftStyle: 'solid',
  borderLeftWidth: 1,
  borderLeftColor: props.theme.controlColorSecondary,
  ...evaluateStyle(props.userStyle, props)
}));

export const TickLabel = styled.div(props => ({
  transform: 'translate(-50%, -18px)',
  ...evaluateStyle(props.userStyle, props)
}));

export const MarkersContainer = styled.div(props => ({
  position: 'relative',
  height: 3,
  ...evaluateStyle(props.userStyle, props)
}));

export const MarkerComponent = styled.div(props => ({
  height: '100%',
  ...evaluateStyle(props.userStyle, props)
}));

export const BufferComponent = styled.div(props => ({
  height: '100%',
  background: props.theme.controlColorHovered,
  ...evaluateStyle(props.userStyle, props)
}));
