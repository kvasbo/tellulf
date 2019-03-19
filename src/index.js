import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

Sentry.init({
  dsn: 'https://ab9aa32b39ab4fc88b0500959309d66a@sentry.io/1412935',
});

Sentry.captureMessage('Tellulf loaded');

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
