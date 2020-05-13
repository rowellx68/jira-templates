import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Popup from '@src/popup/Popup';
import { browser } from 'webextension-polyfill-ts';

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  ReactDOM.render(<Popup />, document.querySelector('#popup'));
});
