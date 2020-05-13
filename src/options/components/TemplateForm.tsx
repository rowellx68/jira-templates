/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import Form, { Field, HelperMessage, OnSubmitHandler } from '@atlaskit/form';
import TextArea from '@atlaskit/textarea';
import Button, { ButtonGroup } from '@atlaskit/button';

interface Props {
  executing: boolean;
  template: string;
  label: string;
  onSubmit: OnSubmitHandler<{ template: string }>;
}

const TemplateForm: React.FunctionComponent<Props> = ({
  executing,
  template,
  label,
  onSubmit,
}) => {
  return (
    <Form<{ template: string }> onSubmit={onSubmit}>
      {({ formProps }) => (
        <form {...formProps}>
          <Field<string, HTMLTextAreaElement>
            name='template'
            label={`${label} Ticket Template`}
            defaultValue={template}
            isDisabled={executing}
          >
            {({ fieldProps }) => (
              <React.Fragment>
                <TextArea
                  {...fieldProps}
                  resize='none'
                  isMonospaced
                  minimumRows={6}
                />
                <HelperMessage>
                  Use the <strong>{'<TI></TI>'}</strong> tags to wrap
                  placeholder texts.
                </HelperMessage>
              </React.Fragment>
            )}
          </Field>
          <div css={css({ marginTop: 8 })}>
            <ButtonGroup>
              <Button type='submit' isDisabled={executing}>
                Save template
              </Button>
            </ButtonGroup>
          </div>
        </form>
      )}
    </Form>
  );
};

export default TemplateForm;
