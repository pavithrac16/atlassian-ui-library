// @flow

import React from 'react';
import { CalendarStateless } from '../src';
import { action } from './utils/_';

export default () => <CalendarStateless onChange={action('change')} />;
