import EmailSerializer from '..';
import { defaultSchema as schema } from '@atlaskit/adf-schema';

import * as paragraphIndents from './__fixtures__/paragraph-indents.adf.json';
import * as paragraphAlign from './__fixtures__/paragraph-align.adf.json';
import * as heading from './__fixtures__/heading.adf.json';
import * as headingAlign from './__fixtures__/heading-align.adf.json';
import * as em from './__fixtures__/em.adf.json';
import * as codeBlock from './__fixtures__/code-block.adf.json';
import * as inlineCodeProps from './__fixtures__/inline-code-props.adf.json';
import * as inlineTextProps from './__fixtures__/inline-text-props.adf.json';
import * as panels from './__fixtures__/panels.adf.json';
import * as link from './__fixtures__/link.adf.json';
import * as decisionList from './__fixtures__/decision-list.adf.json';
import * as taskList from './__fixtures__/task-list.adf.json';
import * as blockCards from './__fixtures__/block-cards.adf.json';
import * as inlineCards from './__fixtures__/inline-cards.adf.json';
import * as status from './__fixtures__/status.adf.json';
import * as tableNumberedColumn from './__fixtures__/table-numbered-column.adf.json';
import * as layoutColumnSection from './__fixtures__/layout-column-section.adf.json';
import * as extensions from './__fixtures__/extensions.adf.json';
import * as date from './__fixtures__/date.adf.json';
import * as mediaSingle from './__fixtures__/media-single.adf.json';
import * as mediaGroup from './__fixtures__/media-group.adf.json';
import * as lists from './__fixtures__/lists.adf.json';
import * as text from './__fixtures__/text.adf.json';

import * as image from './__fixtures__/image.adf.json';
import * as placeholder from './__fixtures__/placeholder.adf.json';
import * as action from './__fixtures__/action.adf.json';
import * as annotation from './__fixtures__/annotation.adf.json';
import * as breakout from './__fixtures__/breakout.adf.json';

const render = (doc: any, withMockEnabled: boolean = false) => {
  const serializer = new EmailSerializer(schema, withMockEnabled);
  const docFromSchema = schema.nodeFromJSON(doc);
  const { result, embeddedImages } = serializer.serializeFragmentWithImages(
    docFromSchema.content,
  );
  const node = document.createElement('div');
  node.innerHTML = result!;
  return {
    result: node.firstChild,
    embeddedImages,
  };
};

describe('Renderer - EmailSerializer', () => {
  it('should render nothing for image node', () => {
    const { result } = render(image);
    expect(result).toMatchSnapshot('html');
  });

  it('should render nothing for placeholder node', () => {
    const { result } = render(placeholder);
    expect(result).toMatchSnapshot('html');
  });

  it('should apply no mark for action marks', () => {
    const { result } = render(action);
    expect(result).toMatchSnapshot('html');
  });

  it('should apply no mark for annotation marks', () => {
    const { result } = render(annotation);
    expect(result).toMatchSnapshot('html');
  });

  it('should apply no mark for breakout marks', () => {
    const { result } = render(breakout);
    expect(result).toMatchSnapshot('html');
  });

  it('should render media single correctly', () => {
    const { result } = render(mediaSingle);
    expect(result).toMatchSnapshot('html');
  });

  it('should render media group correctly', () => {
    const { result } = render(mediaGroup);
    expect(result).toMatchSnapshot('html');
  });

  it('should render decision list correctly', () => {
    const { result, embeddedImages } = render(decisionList);
    expect(result).toMatchSnapshot('html');
    expect(embeddedImages).toMatchSnapshot('embeddedImages');
  });

  it('should render decision list correctly with mock enabled', () => {
    const { result, embeddedImages } = render(decisionList, true);
    expect(result).toMatchSnapshot('mock-html');
    expect(embeddedImages).toMatchSnapshot('mock-embeddedImages');
  });

  it('should render task list correctly', () => {
    const { result, embeddedImages } = render(taskList);
    expect(result).toMatchSnapshot('html');
    expect(embeddedImages).toMatchSnapshot('embeddedImages');
  });

  it('should render task list correctly with mock enabled', () => {
    const { result, embeddedImages } = render(taskList, true);
    expect(result).toMatchSnapshot('mock-html');
    expect(embeddedImages).toMatchSnapshot('mock-embeddedImages');
  });

  it('should render block cards correctly', () => {
    const { result } = render(blockCards);
    expect(result).toMatchSnapshot('html');
  });

  it('should render inline cards correctly', () => {
    const { result } = render(inlineCards);
    expect(result).toMatchSnapshot('html');
  });

  it('should render text with em inside of a paragraph correctly', () => {
    const { result } = render(em);
    expect(result).toMatchSnapshot('html');
  });

  it('should render panels correctly', () => {
    const { result, embeddedImages } = render(panels);
    expect(result).toMatchSnapshot('html');
    expect(embeddedImages).toMatchSnapshot('embeddedImages');
  });

  it('should render panels correctly with mock enabled', () => {
    const { result, embeddedImages } = render(panels, true);
    expect(result).toMatchSnapshot('mock-html');
    expect(embeddedImages).toMatchSnapshot('mock-embeddedImages');
  });

  it('should align paragraph correctly', () => {
    const { result } = render(paragraphAlign);
    expect(result).toMatchSnapshot('html');
  });

  it('should align heading correctly', () => {
    const { result } = render(headingAlign);
    expect(result).toMatchSnapshot('html');
  });

  it('should render headings 1-6 correctly', () => {
    const { result } = render(heading);
    expect(result).toMatchSnapshot('html');
  });

  it('should inline text properties correctly', () => {
    const { result } = render(inlineTextProps);
    expect(result).toMatchSnapshot('html');
  });

  it('should inline code properties correctly', () => {
    const { result } = render(inlineCodeProps);
    expect(result).toMatchSnapshot('html');
  });

  it('should render codeblock correctly', () => {
    const { result } = render(codeBlock);
    expect(result).toMatchSnapshot('html');
  });

  it('should render paragraph with indentations', () => {
    const { result } = render(paragraphIndents);
    expect(result).toMatchSnapshot('html');
  });

  it('should render link', () => {
    const { result } = render(link);
    expect(result).toMatchSnapshot('html');
  });

  it('should render text and does not interpret HTML', () => {
    const { result } = render(text);
    expect(result).toMatchSnapshot('html');
  });

  it('should render status correctly', () => {
    const { result } = render(status);
    expect(result).toMatchSnapshot('html');
  });

  it('should render numbered column for table', () => {
    const { result } = render(tableNumberedColumn);
    expect(result).toMatchSnapshot('html');
  });

  it('should render layout column and sections', () => {
    const { result } = render(layoutColumnSection);
    expect(result).toMatchSnapshot('html');
  });

  it('should render extension placeholders', () => {
    const { result } = render(extensions);
    expect(result).toMatchSnapshot('html');
  });

  it('should render dates in normal text and task lists', () => {
    const { result } = render(date);
    expect(result).toMatchSnapshot('html');
  });

  it('should render lists', () => {
    const { result } = render(lists);
    expect(result).toMatchSnapshot('html');
  });
});
