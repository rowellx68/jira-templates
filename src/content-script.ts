import { documentObserver } from '@src/observers';
import { domainsMatched } from '@src/utilities/helpers';
import { browser } from 'webextension-polyfill-ts';

const attachDocumentObserver = () => {
  browser.runtime.sendMessage('getDomains').then((domains: string[]) => {
    if (!domains?.length) {
      return;
    }

    const host = document.location.hostname;
    const matched = domainsMatched(host, domains);

    if (!matched) {
      return;
    }

    documentObserver.disconnect();
    documentObserver.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['resolved'],
    });
  });
};

attachDocumentObserver();
