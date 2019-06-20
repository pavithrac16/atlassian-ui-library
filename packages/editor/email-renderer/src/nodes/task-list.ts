import { NodeSerializerOpts } from '../interfaces';
import { createTag } from '../util';

export default function taskList({ text }: NodeSerializerOpts) {
  return createTag('div', {}, text);
}
