// @flow

import React from 'react';
import { mount, shallow } from 'enzyme';

import {
  AnalyticsListener,
  AnalyticsContext,
  UIAnalyticsEvent,
} from '@atlaskit/analytics-next';
import {
  name as packageName,
  version as packageVersion,
} from '../../../package.json';

import { getMonthName } from '../../util';
import { Announcer } from '../../styled/Calendar';
import { MonthAndYear } from '../../styled/Heading';
import DateComponent from '../../components/Date';

import CalendarStatelessWithAnalytics, {
  CalendarStateless,
} from '../CalendarStateless';

const now = new Date();
const nowMonth = now.getMonth() + 1;
const nowYear = now.getFullYear();

test('should render the component', () => {
  const wrapper = shallow(<CalendarStateless />);
  expect(wrapper.length).toBeGreaterThan(0);
  expect(wrapper.find(Announcer)).toHaveLength(1);
  expect(wrapper.find(DateComponent).length).toBeGreaterThan(0);
});

test('should highlight current date', () => {
  const wrapper = mount(<CalendarStateless />);
  expect(
    wrapper
      .find(MonthAndYear)
      .at(0)
      .text()
      .includes(`${getMonthName(nowMonth)} ${nowYear}`),
  ).toBe(true);
});

test('should call onSelect', () => {
  const spy = jest.fn();
  const wrapper = shallow(
    <CalendarStateless month={1} year={2016} onSelect={spy} />,
  );
  wrapper
    .find(DateComponent)
    .find({
      children: 1,
      sibling: false,
    })
    .simulate('click', {
      day: 1,
      month: 1,
      year: 2016,
    });
  expect(spy).toHaveBeenCalledWith({
    day: 1,
    month: 1,
    year: 2016,
    iso: '2016-01-01',
  });
});

test('specifying selected days should select the specified days', () => {
  const wrapper = shallow(
    <CalendarStateless
      month={1}
      year={2016}
      selected={['2016-01-01', '2016-01-02']}
    />,
  );

  expect(wrapper.find({ selected: true })).toHaveLength(2);
  expect(
    wrapper.find({
      children: 1,
      selected: true,
    }),
  ).toHaveLength(1);
  expect(
    wrapper.find({
      children: 2,
      selected: true,
    }),
  ).toHaveLength(1);
});
describe('analytics - CalendarStateless', () => {
  it('should provide analytics context with component, package and version fields', () => {
    const wrapper = shallow(<CalendarStatelessWithAnalytics />);

    expect(wrapper.find(AnalyticsContext).prop('data')).toEqual({
      component: 'calendar',
      package: packageName,
      version: packageVersion,
    });
  });

  it('should pass analytics event as last argument to onUpdate handler', () => {});

  it('should fire an atlaskit analytics event on update', () => {});
});
