import * as React from 'react';
import {
  OptionType,
  ValueType,
  CreatableSelect,
  ActionMeta,
} from '@atlaskit/select';
import { Field, HelperMessage } from '@atlaskit/form';

interface Props {
  executing: boolean;
  options: OptionType[];
  onCreate: (option: ValueType<OptionType>) => void | Promise<void>;
  onSelect: (option: ValueType<OptionType>) => void | Promise<void>;
  onRemove: () => void | Promise<void>;
}

const TicketTypeSelect: React.FunctionComponent<Props> = ({
  children,
  executing,
  options,
  onCreate,
  onSelect,
  onRemove,
}) => {
  const [currentTicketType, setCurrentTicketType] = React.useState(
    null as ValueType<OptionType>,
  );

  const handleTicketTypeSubmit = async (
    value: ValueType<OptionType>,
    action: ActionMeta<OptionType>,
  ) => {
    if (action.action === 'create-option') {
      onCreate(value);
      setCurrentTicketType(value);
    }

    if (action.action === 'select-option') {
      onSelect(value);
      setCurrentTicketType(value);
    }

    if (action.action === 'clear') {
      onRemove();
      setCurrentTicketType(null);
    }
  };

  return (
    <React.Fragment>
      <Field label='Ticket Type' name='ticketType'>
        {({ fieldProps }) => (
          <React.Fragment>
            <CreatableSelect
              name={fieldProps.name}
              options={options}
              value={currentTicketType}
              onChange={handleTicketTypeSubmit}
              placeholder='Bug'
              isDisabled={executing}
              menuPlacement='auto'
              styles={{
                menuList: (provided) => ({
                  ...provided,
                  maxHeight: 150,
                }),
              }}
              isClearable
            />
            {!currentTicketType && (
              <HelperMessage>
                Select one or add a ticket type to see the template.
              </HelperMessage>
            )}
          </React.Fragment>
        )}
      </Field>
      {currentTicketType && children}
    </React.Fragment>
  );
};

export default TicketTypeSelect;
