/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import Tabs from '@atlaskit/tabs';
import BasicOptions from './BasicOptions';
import AdvancedOptions from './AdvancedOptions';
import ImportExport from './ImportExport';

const Options: React.FunctionComponent = () => {
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
    <div css={css({ padding: '1rem', minHeight: 500 })}>
      <Tabs tabs={tabs} />
    </div>
  );
};

export default Options;
