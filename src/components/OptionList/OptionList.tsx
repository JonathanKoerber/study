import React, { useEffect, useState } from 'react';
import {
  OptionListAddOtherButton, OptionListCheck, OptionListInput, OptionListInputContainer, OptionListItem,
} from './style';

interface OptionListItemProps {
  value: string;
  label: string;
  excludable?: boolean;
}
interface OptionListValue {
  selected: string[];
  other?: string;
}

interface OptionListProps {
  value?: OptionListValue;
  items: OptionListItemProps[];
  excludableValue?: string;
  singleSelection?: boolean;
  onChange?: (value: OptionListValue) => void;
  allowAddOther?: boolean;
  addOtherLabel?: string;
  enableOther?: boolean;
  otherPlaceholder?: string;
}
const defaultValue = { selected: [], other: '' };
const OptionList = ({
  value = defaultValue, items, excludableValue, singleSelection,
  onChange, allowAddOther, addOtherLabel, enableOther, otherPlaceholder,
}: OptionListProps) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  console.log(value);
  useEffect(() => {
    setShowOtherInput(!!enableOther || !!value?.other);
  }, [value, enableOther]);

  const selectItem = (selectedItem: OptionListItemProps) => {
    const { selected, other } = value;
    let newSelected: string[];
    let newOtherValue: string | undefined;

    const index = selected.indexOf(selectedItem.value);

    if (index >= 0) {
      newSelected = [...selected.slice(0, index), ...selected.slice(index + 1)];
      newOtherValue = other;
    } else if (singleSelection) {
      newSelected = [selectedItem.value];
      newOtherValue = undefined;
    } else if (selectedItem.value === excludableValue || (excludableValue && selected.includes(excludableValue))) {
      newSelected = [selectedItem.value];
      newOtherValue = undefined;
    } else {
      newSelected = [...selected, selectedItem.value];
      newOtherValue = other;
    }

    if (onChange) {
      onChange({
        selected: newSelected,
        other: newOtherValue,
      });
    }
  };

  const otherChangeHandler = (newOtherVaue: string) => {
    const { selected } = value;
    let newSelected: string[];

    if (singleSelection || (excludableValue && selected.includes(excludableValue))) {
      newSelected = [];
    } else {
      newSelected = selected;
    }

    if (onChange) {
      onChange({
        selected: newSelected,
        other: newOtherVaue,
      });
    }

    if (!newOtherVaue) {
      setShowOtherInput(false);
    }
  };

  const addOtherClickHandler = () => {
    setShowOtherInput(true);
  };

  return (
    <>
      {items.map((item, index) => {
        const isSelected = value?.selected?.includes(item.value);
        return (
          <OptionListItem
            key={item.value}
            lastItem={items.length === index + 1 && !allowAddOther && !enableOther}
            onClick={() => selectItem(item)}
            isSelected={isSelected}
          >
            {item.label}
            <OptionListCheck isSelected={isSelected} />
          </OptionListItem>
        );
      })}
      {allowAddOther && !showOtherInput && (
      <OptionListAddOtherButton onClick={addOtherClickHandler} lastItem>
        {addOtherLabel}
      </OptionListAddOtherButton>
      )}
      {showOtherInput && (
        <OptionListInputContainer>
          <OptionListInput
            placeholder={otherPlaceholder}
            value={value?.other || ''}
            isSelected={!!(value?.other)}
            onChange={e => otherChangeHandler(e.target.value)}
          />
          {!!(value?.other) && (
            <OptionListCheck />
          )}
        </OptionListInputContainer>
      )}
    </>
  );
};

OptionList.defaultProps = {
  value: defaultValue,
  excludableValue: undefined,
  singleSelection: false,
  onChange: undefined,
  allowAddOther: false,
  addOtherLabel: '',
  enableOther: false,
  otherPlaceholder: '',
};

export default React.memo(OptionList);
