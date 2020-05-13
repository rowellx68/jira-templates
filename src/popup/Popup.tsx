/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import Tabs from '@atlaskit/tabs';
import { domainsMatched } from '@src/utilities/helpers';
import { browser } from 'webextension-polyfill-ts';
import BasicOptions from '@src/options/BasicOptions';
import AdvancedOptions from '@src/options/AdvancedOptions';
import ImportExport from '@src/options/ImportExport';

const container = css({
  width: 400,
  minHeight: 500,
  p: {
    paddingTop: '1rem',
    textAlign: 'center',
  },
});

const Popup: React.FunctionComponent = () => {
  const [matchedDomain, setMatchedDomain] = React.useState(false);

  React.useEffect(() => {
    browser.runtime
      .sendMessage('getDomains')
      .then(async (domains: string[]) => {
        const tab = await browser.tabs
          .query({ active: true, currentWindow: true })
          .then((tabs) => tabs[0]);

        if (!tab) {
          return;
        }

        if (!domains?.length) {
          setMatchedDomain(false);
          return;
        }

        const matched = domainsMatched(tab.url || '', domains);
        setMatchedDomain(matched);
      });
  }, []);

  const tabs = [
    {
      label: 'Basic',
      content: <BasicOptions />,
    },
    {
      label: 'Import/Export',
      content: <ImportExport />,
    },
    {
      label: 'Advanced',
      content: <AdvancedOptions />,
    },
  ];

  return (
    <div css={container}>
      <p>
        {matchedDomain ? '👍' : '👎'} <strong>Jira Templates</strong> are{' '}
        {matchedDomain ? 'applied' : 'not applied'} to this domain.
      </p>
      <div css={css({ paddingTop: '1rem', paddingBottom: 8, width: '100%' })}>
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
};

export default Popup;
