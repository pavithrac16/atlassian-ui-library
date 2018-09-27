// @flow
import * as React from 'react';
import type { DraggableLocation, Combine } from 'react-beautiful-dnd';
import type {
  TreeData,
  Path,
  ItemId,
  FlattenedTree,
  TreeSourcePosition,
  TreeDestinationPosition,
} from '../../types';
import { type RenderItemParams } from '../TreeItem/TreeItem-types';

export type Props = {|
  /** The tree data structure. */
  tree: TreeData,
  /** Function that will be called when a parent item needs to be expanded. */
  onExpand: (itemId: ItemId, path: Path) => void,
  /** Function that will be called when a parent item needs to be collapsed. */
  onCollapse: (itemId: ItemId, path: Path) => void,
  /** Function that will be called when the user starts dragging. */
  onDragStart: (itemId: ItemId) => void,
  /** Function that will be called when the user finishes dragging. */
  onDragEnd: (
    sourcePosition: TreeSourcePosition,
    destinationPosition: ?TreeDestinationPosition,
  ) => void,
  /** Function that will be called to render a single item. */
  renderItem: RenderItemParams => React.Node,
  /** Number of pixel is used to scaffold the tree by the consumer. */
  offsetPerLevel: number,
  /** Boolean to turn on drag&drop re-ordering on the tree */
  isDragEnabled: boolean,
  isNestingEnabled: boolean,
|};

export type State = {|
  /** The flattened tree data structure transformed from props.tree */
  flattenedTree: FlattenedTree,
|};

export type DragState = {|
  // Id of the currently dragged item
  draggedItemId: ItemId,
  // Source location
  source: DraggableLocation,
  // Pending destination location
  destination?: ?DraggableLocation,
  // Last level, while the user moved an item horizontally
  horizontalLevel?: ?number,
  // Combine for nesting operation
  combine?: Combine,
|};
