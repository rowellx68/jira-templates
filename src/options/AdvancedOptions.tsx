/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { Field, HelperMessage } from '@atlaskit/form';
import ModalDialog, { ModalTransition } from '@atlaskit/modal-dialog';
import Select, { ValueType, OptionType, ActionMeta } from '@atlaskit/select';
import Button from '@atlaskit/button';
import { browser } from 'webextension-polyfill-ts';
import {
  mapObjectKeysToSelectOptions,
  mapTicketTypeToSelectOptions,
} from '@src/utilities/helpers';

const AdvancedOptions: React.FunctionComponent = () => {
  const [projectCodes, setProjectCodes] = React.useState([] as OptionType[]);
  const [ticketTypes, setTicketTypes] = React.useState([] as OptionType[]);
  const [currentProject, setCurrentProject] = React.useState(
    null as ValueType<OptionType>,
  );
  const [currentTemplate, setCurrentTemplate] = React.useState(
    null as ValueType<OptionType>,
  );
  const [
    confirmResetOptionsModalOpen,
    setConfirmResetOptionsModalOpen,
  ] = React.useState(false);
  const [
    confirmDeleteProjectModalOpen,
    setConfirmDeleteProjectModalOpen,
  ] = React.useState(false);
  const [
    confirmDeleteTemplateModalOpen,
    setConfirmDeleteTemplateModalOpen,
  ] = React.useState(false);

  const handleProjectCodeSubmit = async (
    value: ValueType<OptionType>,
    action: ActionMeta<OptionType>,
  ) => {
    if (action.action === 'select-option') {
      setCurrentProject(value);

      const projectTemplates = (await browser.storage.local.get(
        `${(value as OptionType).value}`,
      )) as Project;

      if (!projectTemplates) {
        return;
      }

      const templates = projectTemplates[`${(value as OptionType).value}`];

      if (!templates) {
        return;
      }

      setTicketTypes(mapObjectKeysToSelectOptions(Object.keys(templates)));
    }

    if (action.action === 'clear') {
      setCurrentProject(null);
      setTicketTypes([]);
    }
  };

  const handleTicketTypeSubmit = async (
    value: ValueType<OptionType>,
    action: ActionMeta<OptionType>,
  ) => {
    if (action.action === 'select-option') {
      setCurrentTemplate(value);
    }

    if (action.action === 'clear') {
      setCurrentTemplate(null);
    }
  };

  const resetOptionsModalActions = [
    {
      text: 'Yes, reset',
      onClick: async () => {
        await browser.storage.local.clear();
        await browser.storage.local.set({ domains: [], projectCodes: [] });
        setConfirmResetOptionsModalOpen(false);
      },
    },
    {
      text: 'Cancel',
      onClick: () => {
        setConfirmResetOptionsModalOpen(false);
      },
    },
  ];

  const deleteProjectModalActions = [
    {
      text: 'Yes, delete project & templates',
      onClick: async () => {
        const projectKey = (currentProject as OptionType).value;
        const options = (await browser.storage.local.get()) as OptionsImport;

        const domains = options['domains'] as string[];
        const projectCodes = (options['projectCodes'] as SelectOption[]).filter(
          (p) => p.value !== projectKey,
        );
        const projectKeys = Object.keys(options).filter(
          (k) => !['domains', 'projectCodes', projectKey],
        );

        let newOptions = {
          domains,
          projectCodes,
        } as OptionsImport;

        projectKeys.forEach((k) => {
          newOptions[k] = options[k];
        });

        await browser.storage.local.set(newOptions);

        setProjectCodes(projectCodes);
        setCurrentTemplate(null);
        setConfirmDeleteProjectModalOpen(false);
      },
    },
    {
      text: 'Cancel',
      onClick: () => {
        setConfirmDeleteProjectModalOpen(false);
      },
    },
  ];

  const deleteTemplateModalActions = [
    {
      text: 'Yes, delete template',
      onClick: async () => {
        const projectKey = (currentProject as OptionType).value as string;
        const templateKey = (currentTemplate as OptionType).value;

        const templates = await browser.storage.local.get([projectKey]);
        const optionKeys = Object.keys(templates[projectKey]).filter(
          (k) => k !== templateKey,
        );

        let newOptions = {} as any;

        optionKeys.forEach((k) => {
          newOptions[projectKey][k] = templates[projectKey][k];
        });

        await browser.storage.local.remove([projectKey]);
        await browser.storage.local.set(newOptions);
        setCurrentTemplate(null);
        setTicketTypes(mapTicketTypeToSelectOptions(optionKeys));
        setConfirmDeleteTemplateModalOpen(false);
      },
    },
    {
      text: 'Cancel',
      onClick: () => {
        setConfirmDeleteTemplateModalOpen(false);
      },
    },
  ];

  React.useEffect(() => {
    browser.storage.local.get(['projectCodes']).then(({ projectCodes }) => {
      setProjectCodes((projectCodes ?? []) as OptionType[]);
    });
  }, []);

  return (
    <div css={css({ width: '100%' })}>
      <ModalTransition>
        {confirmResetOptionsModalOpen && (
          <ModalDialog
            actions={resetOptionsModalActions}
            heading='Reset options to defaults?'
            onClose={() => setConfirmResetOptionsModalOpen(false)}
            appearance='danger'
          >
            Are you sure you would like to reset the options? You will not be
            able to undo this once you have performed the action.
          </ModalDialog>
        )}

        {confirmDeleteProjectModalOpen && (
          <ModalDialog
            actions={deleteProjectModalActions}
            heading='Delete project and templates?'
            onClose={() => setConfirmDeleteProjectModalOpen(false)}
            appearance='danger'
          >
            Are you sure you would like to delete this project? It will also
            delete the templates associated with it. You will not be able to
            undo this once you have performed the action.
          </ModalDialog>
        )}

        {confirmDeleteTemplateModalOpen && (
          <ModalDialog
            actions={deleteTemplateModalActions}
            heading='Delete template?'
            onClose={() => setConfirmDeleteTemplateModalOpen(false)}
            appearance='danger'
          >
            Are you sure you would like to delete this template? You will not be
            able to undo this once you have performed the action.
          </ModalDialog>
        )}
      </ModalTransition>

      <div>
        <Field label='Project' name='projectCode'>
          {({ fieldProps }) => (
            <React.Fragment>
              <Select
                name={fieldProps.name}
                options={projectCodes}
                onChange={handleProjectCodeSubmit}
                placeholder='PROJ'
                menuPlacement='auto'
                styles={{
                  menuList: (provided) => ({
                    ...provided,
                    maxHeight: 150,
                  }),
                }}
                isClearable
              />
              {!currentProject ? (
                <HelperMessage>Select a project code.</HelperMessage>
              ) : (
                <div css={css({ marginTop: 8 })}>
                  <Button
                    onClick={() => setConfirmDeleteProjectModalOpen(true)}
                    appearance='warning'
                  >
                    Delete project
                  </Button>
                </div>
              )}
            </React.Fragment>
          )}
        </Field>
      </div>

      {currentProject && (
        <Field label='Templates' name='template'>
          {({ fieldProps }) => (
            <React.Fragment>
              <Select
                name={fieldProps.name}
                options={ticketTypes}
                onChange={handleTicketTypeSubmit}
                placeholder='Bug'
                menuPlacement='auto'
                styles={{
                  menuList: (provided) => ({
                    ...provided,
                    maxHeight: 150,
                  }),
                }}
                isClearable
              />
              {!currentTemplate ? (
                <HelperMessage>Select a ticket type.</HelperMessage>
              ) : (
                <div css={css({ marginTop: 8 })}>
                  <Button
                    onClick={() => setConfirmDeleteTemplateModalOpen(true)}
                    appearance='warning'
                  >
                    Delete template
                  </Button>
                </div>
              )}
            </React.Fragment>
          )}
        </Field>
      )}

      <Field name='resetOptions' label='Reset options'>
        {() => (
          <div>
            <Button
              appearance='danger'
              onClick={() => setConfirmResetOptionsModalOpen(true)}
            >
              Reset to defaults
            </Button>
          </div>
        )}
      </Field>
    </div>
  );
};

export default AdvancedOptions;
