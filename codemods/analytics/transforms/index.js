// @flow
import path from 'path';
import UtilPlugin from '../../plugins/util';

import { getMapEntryFromPath, getPackageJsonPath } from '../util';
import addTests from './tests';

const createImport = (j, specifierNames, source) => {
  const specifiers = specifierNames.map( name =>
    j.importSpecifier(j.identifier(name))
  );

  return j.importDeclaration(specifiers, j.literal(source));
};

const createEventMapPropFn = (j, action) => {
  const code = `
    createAnalyticsEvent => {
      const consumerEvent = createAnalyticsEvent({
        action: '${action}',
      });
      consumerEvent.clone().fire('atlaskit');

      return consumerEvent;
    }
  `;

  return j(code).find(j.ArrowFunctionExpression).get().value;
};

const createAnalyticsEventsHoc = (j, eventConfig, inner) => {
  const existingHoc = j(inner).find(j.Identifier, { name: 'withAnalyticsEvents' });
  if (existingHoc.size() > 0) {
    return inner;
  }

  const eventMap = j.objectExpression(Object.keys(eventConfig.props).map( propName => {
    const action = eventConfig.props[propName];
    return j.property('init', j.identifier(propName), createEventMapPropFn(j, action));
  }));
  const firstCall = j.callExpression(j.identifier('withAnalyticsEvents'), [eventMap]);
  return j.callExpression(firstCall, [inner]);
};

const createAnalyticsContextHoc = (j, eventConfig, inner) => {
  const existingHoc = j(inner).find(j.Identifier, { name: 'withAnalyticsContext' });
  if (existingHoc.size() > 0) {
    return inner;
  }

  const contextArgs = j.objectExpression([
    j.property('init', j.identifier('component'), j.literal(eventConfig.context)),
    j.property('init', j.identifier('package'), j.identifier('packageName')),
    j.property('init', j.identifier('version'), j.identifier('packageVersion'))
  ]);

  const firstCall = j.callExpression(j.identifier('withAnalyticsContext'), [contextArgs]);
  return j.callExpression(firstCall, [inner]);
}

const createAnalyticsHocs = (j, eventConfig, inner) => {
  const withAnalyticsEvents = createAnalyticsEventsHoc(j, eventConfig, inner);

  return createAnalyticsContextHoc(j, eventConfig, withAnalyticsEvents);
}

const hasAnalyticsHoc = (j, path) => (
  j(path).find(j.Identifier, { name: 'withAnalyticsEvents' }).size() > 0
);

// Used to export an original default expression
// Prevents naming conflicts
const exportDefaultExpression = (j, root, eventConfig, original) => {
  const componentName = eventConfig.component;
  let statements = [];
  const existingComponentNameVar = root
    .find(j.Declaration, { id: { name: componentName }})
    .filter( path => path.scope.isGlobal)
    .size() > 0;
  const existingComponentNameImport = root
    .find(j.ModuleSpecifier, { local:  { name: componentName }})
    .size() > 0;
  
  if (existingComponentNameVar || existingComponentNameImport) {
    // Already have an identifier with the component name in the current scope
    // Check whether it is exported
    const isExported = root
      .find(j.ExportNamedDeclaration)
      .filter( path =>
        path.find(j.ExportSpecifier, { exported: { name: componentName } }).size() > 0 ||
        path.find(j.VariableDeclarator, { id: { name: componentName } }).size() > 0
      )
      .filter( path => path.scope.isGlobal)
      .size() > 0;
    if (isExported) {
      throw new Error('Cannot export original component with the component name specified in config as something is already exported with that name');
    }
    const localComponentNameId = j.identifier(`${componentName}WithoutAnalytics`);
    statements.push(
      j.variableDeclaration(
        'const',
        [j.variableDeclarator(localComponentNameId, original)]
      )
    );
    statements.push(
      j.exportNamedDeclaration(
        null,
        [j.exportSpecifier(localComponentNameId, j.identifier(componentName))]
      )
    );
  } else {
    statements.push(
      j.exportNamedDeclaration(
        j.variableDeclaration(
          'const',
          [j.variableDeclarator(j.identifier(componentName), original)]
        )
      )
    );
  }

  return statements;
}

module.exports = (fileInfo: any, api: any) => {
  const j = api.jscodeshift;
  const { statement } = j.template;
  j.use(UtilPlugin);

  const analyticsEventConfigs = getMapEntryFromPath(fileInfo.path, 'path');
  if (!analyticsEventConfigs || analyticsEventConfigs.length === 0) {
    return null;
  }
  const analyticsEventConfig = analyticsEventConfigs[0];
  const source = j(fileInfo.source);
  
  const absoluteFilePath = path.resolve(process.cwd(), fileInfo.path);
  const packageJsonPath = getPackageJsonPath(absoluteFilePath);

  source
    // Add relevant imports
    .addImport(source.code(`
      import { withAnalyticsEvents, withAnalyticsContext } from '@atlaskit/analytics-next';
    `))
    .addImport(source.code(`
      import { name as packageName, version as packageVersion } from '${packageJsonPath}';
    `));

  if (analyticsEventConfig.wrapTarget) {
    source
      .findLast(j.VariableDeclarator, (node) => node.id.name === analyticsEventConfig.wrapTarget)
      .map( path => {
        path.node.init = createAnalyticsHocs(j, analyticsEventConfig, path.node.init);
      });
    console.log('Component with "wrapTarget" detected, make sure you manually update the file to export the class');
  } else {
    source
      .find(j.ExportDefaultDeclaration)
      .map( path => {
        const exportContents = path.node.declaration;
        if (hasAnalyticsHoc(j, path)) {
          return path;
        }
        if (j.Expression.check(exportContents)) {
          // If we're an expression, assign this to a variable and export it so we can use the original
          // reference when unit testing
          const exportStatements = exportDefaultExpression(j, source, analyticsEventConfig, exportContents);
          exportStatements.forEach( s => {
            path.insertBefore(s);
          });
          const exportId = j(exportStatements[0]).findFirst(j.VariableDeclarator);
          path.node.declaration = createAnalyticsHocs(j, analyticsEventConfig, exportId.get().node.id);
        } else if (j.Declaration.check(exportContents)) {
          // Else if we're a declaration, we must extract the declaration out of the export
          // and then wrap the declaration with a HOC within the export
          if (j.ClassDeclaration.check(exportContents)) {
            const declarationId = exportContents.id;
            // Still export the original value as a named export so we can continue to use that in unit tests
            path.insertBefore(j.exportNamedDeclaration(exportContents));
            path.node.declaration = createAnalyticsHocs(j, analyticsEventConfig, declarationId);
          } else {
            throw new Error('Default function export found. Please specify a wrapTarget in analyticsEventMap or refactor the code first to provide a default class export or function call');
          }   
        }
        return path;
      });
  }
    
  // Print source
  return source.toSource({ quote: 'single' });
};
module.exports.parser = 'flow';