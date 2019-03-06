import { EmailSerializer } from '../../../index';
import { defaultSchema as schema } from '@atlaskit/adf-schema';

const render = (doc: any) => {
  const serializer = EmailSerializer.fromSchema(schema);
  const docFromSchema = schema.nodeFromJSON(doc);
  const serialized = serializer.serializeFragment(docFromSchema.content);
  const node = document.createElement('div');
  node.innerHTML = serialized;
  return node.firstChild;
};

describe('Renderer - EmailSerializer', () => {
  it('should inline text properties correctly', () => {
    const doc = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'foo' }],
        },
      ],
    };
    const output = render(doc);
    expect(output).toMatchSnapshot();
  });

  it('should inline code properties correctly', () => {
    const doc = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'text',
          text: 'const foo = bar();',
          marks: [
            {
              type: 'code',
            },
          ],
        },
      ],
    };
    const output = render(doc);
    expect(output).toMatchSnapshot();
  });

  it('should render codeblock correctly', () => {
    const doc = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'codeBlock',
          content: [
            {
              type: 'text',
              text:
                '// Create a map.\nfinal IntIntOpenHashMap map = new IntIntOpenHashMap();\nmap.put(1, 2);\nmap.put(2, 5);\nmap.put(3, 10);',
            },
            {
              type: 'text',
              text:
                '\nint count = map.forEach(new IntIntProcedure()\n{\n   int count;\n   public void apply(int key, int value)\n   {\n       if (value >= 5) count++;\n   }\n}).count;\nSystem.out.println("There are " + count + " values >= 5");',
            },
          ],
          attrs: {
            language: 'javascript',
          },
        },
      ],
    };
    const output = render(doc);
    expect(output).toMatchSnapshot();
  });
});