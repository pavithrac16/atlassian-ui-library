// @flow
import React, { Component } from 'react';
import MultiSelect from '@atlaskit/multi-select';
import Group from '@atlaskit/tag-group';
import Tag from '@atlaskit/tag';
import InlineEdit from '../src';

const MultiSelectItems = [
  { content: 'Apple', value: 'Apple' },
  { content: 'Banana', value: 'Banana' },
  { content: 'Cherry', value: 'Cherry' },
  { content: 'Mango', value: 'Mango' },
  { content: 'Orange', value: 'Orange' },
  { content: 'Strawberry', value: 'Strawberry' },
  { content: 'Watermelon', value: 'Watermelon' },
];

type State = {
  onEventResult: string,
};

export default class SelectExample extends Component<void, State> {
  state = {
    editValue: '',
  };

  onConfirmHandler = (event: any) => {
    this.setState({
      onEventResult: `onConfirm called with value: ${event.target.value}`,
      editValue: event.target.value,
    });
  };

  onCancelHandler = (event: any) => {
    this.setState({
      onEventResult: `onCancel called with value: ${event.target.value}`,
      editValue: event.target.value,
    });
  };

  renderEditView = () => (
    <MultiSelect
      defaultSelected={MultiSelectItems}
      items={MultiSelectItems}
      isDefaultOpen
      shouldFitContainer
      shouldFocus
    />
  );

  renderReadView = () => (
    <Group>
      <Tag text="Apple" />
      <Tag text="Banana" />
      <Tag text="Cherry" />
      <Tag text="Mango" />
      <Tag text="Orange" />
      <Tag text="Strawberry" />
      <Tag text="Watermelon" />
    </Group>
  );

  render() {
    return (
      <div>
        <InlineEdit
          label="With Multi Select Edit View"
          disableEditViewFieldBase
          editView={this.renderEditView()}
          readView={this.renderReadView()}
          onConfirm={this.onConfirmHandler}
          onCancel={this.onCancelHandler}
        />
        <div
          style={{
            borderStyle: 'dashed',
            borderWidth: '1px',
            borderColor: '#ccc',
            padding: '0.5em',
            color: '#ccc',
            margin: '0.5em',
          }}
        >
          State updated with value: {this.state.editValue}
        </div>
      </div>
    );
  }
}
