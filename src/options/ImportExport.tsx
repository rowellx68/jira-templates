/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import Form, {
  Field,
  HelperMessage,
  ErrorMessage,
  OnSubmitHandler,
} from '@atlaskit/form';
import ModalDialog, { ModalTransition } from '@atlaskit/modal-dialog';
import TextArea from '@atlaskit/textarea';
import Button, { ButtonGroup } from '@atlaskit/button';
import { browser } from 'webextension-polyfill-ts';
import { validateOptionInput } from '@src/utilities/helpers';

const ImportExport: React.FunctionComponent = () => {
  const [legacyTemplates, setLegacyTemplates] = React.useState('');
  const [confirmDiscardModalOpen, setConfirmDiscardModalOpen] = React.useState(
    false,
  );
  const textArea = React.useRef<HTMLTextAreaElement>(null);

  const handleOptionsImport: OnSubmitHandler<{ options: string }> = async (
    { options },
    formApi,
  ) => {
    const optionsObject = await validateOptionInput(options);

    if (!optionsObject) {
      return;
    }

    await browser.storage.local.set(optionsObject);
    formApi.change('options', '');
    formApi.reset();
  };

  const handleOptionsExport = async () => {
    const options = await browser.storage.local.get();
    if (textArea.current) {
      textArea.current.value = JSON.stringify(options, null, 2);
    }
  };

  React.useEffect(() => {
    browser.storage.local.get('templates').then(({ templates }) => {
      if (!templates) {
        return;
      }

      setLegacyTemplates(JSON.stringify(templates));
    });
  }, []);

  const discardModalActions = [
    {
      text: 'Yes, discard',
      onClick: async () => {
        await browser.storage.local.remove('templates');
        setConfirmDiscardModalOpen(false);
        setLegacyTemplates('');
      },
    },
    {
      text: 'Cancel',
      onClick: () => {
        setConfirmDiscardModalOpen(false);
      },
    },
  ];

  return (
    <div css={css({ width: '100%' })}>
      <ModalTransition>
        {confirmDiscardModalOpen && (
          <ModalDialog
            actions={discardModalActions}
            heading='Discard legacy templates?'
            onClose={() => setConfirmDiscardModalOpen(false)}
            appearance='danger'
          >
            Are you sure you would like to discard of the legacy templates? You
            will not be able to undo this once you have performed the action.
          </ModalDialog>
        )}
      </ModalTransition>

      <Form<{ options: string }> onSubmit={handleOptionsImport}>
        {({ formProps }) => (
          <form {...formProps}>
            <Field<string, HTMLTextAreaElement>
              name='options'
              label='Options'
              validate={async (options) => {
                if (!options) {
                  return;
                }

                const optionsObject = await validateOptionInput(options);

                if (!optionsObject) {
                  return 'Invalid options. Please verify that the properties are of the correct shape.';
                }
              }}
            >
              {({ fieldProps, error }) => (
                <React.Fragment>
                  <TextArea
                    {...fieldProps}
                    forwardedRef={textArea}
                    maxHeight='100%'
                    minimumRows={13}
                    resize='none'
                    isMonospaced
                  />
                  {error && (
                    <ErrorMessage>
                      {error}&nbsp;
                      <a href='https://rowell.heria.uk/jira-templates#what-is-the-options-schema'>
                        More info here.
                      </a>
                    </ErrorMessage>
                  )}
                </React.Fragment>
              )}
            </Field>
            <div css={css({ marginTop: 8 })}>
              <ButtonGroup>
                <Button appearance='warning' type='submit'>
                  Import options
                </Button>
                <Button appearance='primary' onClick={handleOptionsExport}>
                  Export options
                </Button>
              </ButtonGroup>
            </div>
          </form>
        )}
      </Form>

      {legacyTemplates && (
        <React.Fragment>
          <Field<string, HTMLTextAreaElement>
            name='options'
            label='Legacy Templates'
          >
            {({ fieldProps }) => (
              <React.Fragment>
                <TextArea
                  {...fieldProps}
                  value={legacyTemplates}
                  isReadOnly
                  minimumRows={5}
                  resize='none'
                  isMonospaced
                />

                <HelperMessage>
                  These templates were not saved against a project. Migrate them
                  using the textbox above.
                </HelperMessage>
              </React.Fragment>
            )}
          </Field>

          <Field name='noop'>
            {() => (
              <Button
                appearance='danger'
                onClick={() =>
                  setConfirmDiscardModalOpen(!confirmDiscardModalOpen)
                }
              >
                Discard legacy templates
              </Button>
            )}
          </Field>
        </React.Fragment>
      )}
    </div>
  );
};

export default ImportExport;
