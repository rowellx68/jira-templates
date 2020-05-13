/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { HelperMessage, OnSubmitHandler } from '@atlaskit/form';
import { InlineEditableTextfield } from '@atlaskit/inline-edit';
import { OptionType, ValueType } from '@atlaskit/select';
import startCase from 'lodash.startcase';
import { browser } from 'webextension-polyfill-ts';
import ProjectCodeSelect from '@src/options/components/ProjectCodeSelect';
import TicketTypeSelect from '@src/options/components/TicketTypeSelect';
import TemplateForm from '@src/options/components/TemplateForm';
import {
  mapObjectKeysToSelectOptions,
  mapProjectCodeToSelectOptions,
  mapTicketTypeToSelectOptions,
} from '@src/utilities/helpers';

const BasicOptions: React.FunctionComponent = () => {
  const [executing, setExecuting] = React.useState(false);
  const [domains, setDomains] = React.useState('');
  const [projectCodes, setProjectCodes] = React.useState([] as OptionType[]);
  const [ticketTypes, setTicketTypes] = React.useState([] as OptionType[]);
  const [currentProject, setCurrentProject] = React.useState('');
  const [currentTicketType, setCurrentTicketType] = React.useState(
    null as ValueType<OptionType>,
  );
  const [currentProjectTemplates, setCurrentProjectTemplates] = React.useState(
    {} as Templates,
  );
  const [currentTemplate, setCurrentTemplate] = React.useState('');

  const handleDomainsSubmit = async (domains: string) => {
    setDomains(domains);
    setExecuting(true);

    await browser.storage.local.set({
      domains: domains.replace(/\s?,.\s?/, ',').split(','),
    });

    setExecuting(false);
  };

  const onProjectCodeCreate = async (option: ValueType<OptionType>) => {
    const newValue = (option as OptionType).value as string;
    const options = [...projectCodes.map((p) => p.value), newValue] as string[];
    const newOptions = mapProjectCodeToSelectOptions(options);

    setProjectCodes(newOptions);
    setCurrentProject(newValue);

    await browser.storage.local.set({
      projectCodes: newOptions,
    });

    let project = {} as Project;
    project[newValue] = {} as Templates;

    await browser.storage.local.set(project);
  };

  const onProjectCodeSelect = async (option: ValueType<OptionType>) => {
    setCurrentProject(`${(option as OptionType).value}`);

    const projectTemplates = (await browser.storage.local.get(
      `${(option as OptionType).value}`,
    )) as Project;

    if (!projectTemplates) {
      return;
    }

    const templates = projectTemplates[`${(option as OptionType).value}`];
    if (!templates) {
      return;
    }

    setTicketTypes(mapObjectKeysToSelectOptions(Object.keys(templates)));
    setCurrentProjectTemplates(templates);
  };

  const onProjectCodeRemove = () => {
    setCurrentProject('');
    setCurrentTicketType(null);
    setTicketTypes([]);
    setCurrentTemplate('');
  };

  const onTicketTypeCreate = async (option: ValueType<OptionType>) => {
    const newValue = (option as OptionType).value as string;
    const options = [...ticketTypes.map((p) => p.value), newValue] as string[];
    const newOptions = mapTicketTypeToSelectOptions(options);
    const newOption = newOptions.find((o) => o.label === startCase(newValue));

    setTicketTypes(newOptions);
    setCurrentTicketType(newOption as ValueType<OptionType>);
    setCurrentTemplate('');
  };

  const onTicketTypeSelect = async (option: ValueType<OptionType>) => {
    setCurrentTicketType(option);
    setCurrentTemplate(
      currentProjectTemplates[`${(option as OptionType).value}`] || '',
    );
  };

  const onTicketTypeRemove = () => {
    setCurrentTicketType(null);
    setCurrentTemplate('');
  };

  const handleSaveTemplate: OnSubmitHandler<{ template: string }> = async (
    { template },
    formApi,
  ) => {
    let templates = { ...currentProjectTemplates };
    templates[`${(currentTicketType as OptionType).value}`] = template;

    setCurrentProjectTemplates(templates);

    let project = {} as Project;
    project[currentProject] = templates;

    await browser.storage.local.set(project);
    formApi.change('template', '');
    formApi.reset();
  };

  React.useEffect(() => {
    browser.storage.local
      .get(['domains', 'projectCodes'])
      .then(({ domains, projectCodes }) => {
        setDomains((domains as string[])?.join(', ') ?? '');
        setProjectCodes((projectCodes ?? []) as OptionType[]);
      })
      .finally(() => {
        setExecuting(false);
      });
  }, []);

  return (
    <div css={css({ width: '100%', boxSizing: 'border-box' })}>
      <div>
        <InlineEditableTextfield
          label='Domains'
          defaultValue={domains}
          onConfirm={handleDomainsSubmit}
          placeholder='Enter domains here...'
          isRequired
          readViewFitContainerWidth
        />
        <HelperMessage>
          You can enter multiple domains, separated by a comma.
        </HelperMessage>
      </div>

      <div>
        <ProjectCodeSelect
          executing={executing}
          options={projectCodes}
          onCreate={onProjectCodeCreate}
          onSelect={onProjectCodeSelect}
          onRemove={onProjectCodeRemove}
        />
      </div>

      {currentProject && (
        <TicketTypeSelect
          executing={executing}
          options={ticketTypes}
          onCreate={onTicketTypeCreate}
          onSelect={onTicketTypeSelect}
          onRemove={onTicketTypeRemove}
        >
          <TemplateForm
            executing={executing}
            template={currentTemplate}
            label={`${(currentTicketType as OptionType)?.label}`}
            onSubmit={handleSaveTemplate}
          />
        </TicketTypeSelect>
      )}
    </div>
  );
};

export default BasicOptions;
