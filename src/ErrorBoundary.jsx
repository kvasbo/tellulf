import React from 'react';
import PropTypes from 'prop-types';
import * as Sentry from '@sentry/browser';

export default class ErrorBoundary extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    Sentry.withScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
        scope.setExtra(key, errorInfo[key]);
      });
      Sentry.captureException(error);
    });
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.object.isRequired,
};
