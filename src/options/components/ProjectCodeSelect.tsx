import * as React from 'react';
import {
  OptionType,
  CreatableSelect,
  ValueType,
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

const ProjectCodeSelect: React.FunctionComponent<Props> = ({
  executing,
  options,
  onCreate,
  onSelect,
  onRemove,
}) => {
  const [currentProject, setCurrentProject] = React.useState(
    null as ValueType<OptionType>,
  );

  const handleProjectCodeSubmit = async (
    value: ValueType<OptionType>,
    action: ActionMeta<OptionType>,
  ) => {
    if (action.action === 'create-option') {
      onCreate(value);
      setCurrentProject(value);
    }

    if (action.action === 'select-option') {
      onSelect(value);
      setCurrentProject(value);
    }

    if (action.action === 'clear') {
      onRemove();
      setCurrentProject(null);
    }
  };

  return (
    <React.Fragment>
      <Field label='Project' name='projectCode'>
        {({ fieldProps }) => (
          <React.Fragment>
            <CreatableSelect
              name={fieldProps.name}
              options={options}
              onChange={handleProjectCodeSubmit}
              onInputChange={(val) => val.toUpperCase()}
              placeholder='PROJ'
              menuPlacement='auto'
              styles={{
                menuList: (provided) => ({
                  ...provided,
                  maxHeight: 150,
                }),
              }}
              isDisabled={executing}
              isClearable
            />
            {!currentProject && (
              <HelperMessage>
                Select one or add a project code to see the ticket types.
              </HelperMessage>
            )}
          </React.Fragment>
        )}
      </Field>
    </React.Fragment>
  );
};

export default ProjectCodeSelect;
