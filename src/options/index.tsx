import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Options from './Options';
import { browser } from 'webextension-polyfill-ts';

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  ReactDOM.render(<Options />, document.querySelector('#options'));
});
