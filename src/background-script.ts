import { domainsMatched } from '@src/utilities/helpers';
import { browser } from 'webextension-polyfill-ts';

type ActionType = 'getDomains';

const iconSetter = async (url: string | undefined) => {
  if (!url) {
    return;
  }

  const domains = await browser.storage.local
    .get('domains')
    .then(({ domains }) => domains as string[]);

  if (!domains?.length) {
    browser.browserAction.setIcon({ path: 'icon-disabled.svg' });
    return;
  }

  const matched = domainsMatched(url ?? '', domains);

  if (!matched) {
    browser.browserAction.setIcon({ path: 'icon-disabled.svg' });
    return;
  }

  browser.browserAction.setIcon({ path: 'icon.svg' });
};

browser.tabs.onActivated.addListener(async ({ tabId }) => {
  const currentTab = await browser.tabs.get(tabId);

  if (!currentTab) {
    return;
  }

  await iconSetter(currentTab.url);
});

browser.tabs.onUpdated.addListener(async (tabId, change, tab) => {
  if (!change.url) {
    return;
  }

  await iconSetter(change.url);
});

browser.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    browser.runtime.openOptionsPage();
  }
});

browser.runtime.onMessage.addListener((req: ActionType) => {
  switch (req) {
    case 'getDomains':
      return browser.storage.local
        .get('domains')
        .then(({ domains }) => domains);
  }
});
