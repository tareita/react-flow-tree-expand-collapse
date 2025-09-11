import { useMemo } from 'react';
import ReactFlow, {
  ConnectionLineType,
  Node,
  MiniMap,
  Controls,
  Background,
} from 'reactflow';

import { convertTreeNodeToNodesAndEdges, tree } from '../../data/nodes-edges';
import { css } from '@emotion/react';
import {
  TreeNode,
  treeNodeHeight,
  treeNodeWidth,
  minimizedNodeHeight,
  minimizedNodeWidth,
} from './TreeNode';
import { Direction, getLayoutedElements } from '../../utils/dagre';
import { action, toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { FlowHandler } from '../../models/FlowHandler';
import { TreeHandler, TreeHandlerContext } from '../../models/TreeHandler';

export enum NodeType {
  TreeNode = 'treeNode',
}

const nodeTypes = {
  [NodeType.TreeNode]: TreeNode,
} as const;

export const LayoutFlow = observer(() => {
  console.log('render');

  // Create handlers with placeholder functions first
  const noop = function () {
    /* placeholder */
  };
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => convertTreeNodeToNodesAndEdges(tree, noop, noop),
    [],
  );

  const getNodeDimensions = (node: Node) => {
    const shouldShowMinimized =
      (node.data?.isMinimized && !node.data?.isFocused) ||
      (node.data?.depth === 1 && !node.data?.isFocused);
    return shouldShowMinimized
      ? { width: minimizedNodeWidth, height: minimizedNodeHeight }
      : { width: treeNodeWidth, height: treeNodeHeight };
  };

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () =>
      getLayoutedElements(
        initialNodes,
        initialEdges,
        Direction.Vertical,
        getNodeDimensions,
      ),
    [initialNodes, initialEdges],
  );

  const flowHandler = useMemo(
    () => new FlowHandler(layoutedNodes, layoutedEdges),
    [layoutedNodes, layoutedEdges],
  );

  const treeHandler = useMemo(() => new TreeHandler(flowHandler), [flowHandler]);

  // Now define the proper handler functions
  const changeShowingChildren = action((nodeId: string, showChildren: boolean) => {
    console.log('changeShowingChildren', nodeId, showChildren);
    const node = treeHandler.flowHandler.nodes.find((node) => node.id === nodeId);

    if (!node) return;

    node.data.showingChildren = showChildren;
  });

  const changeFocused = action((nodeId: string, focused: boolean) => {
    console.log('changeFocused', nodeId, focused);
    const node = treeHandler.flowHandler.nodes.find((node) => node.id === nodeId);

    if (!node) return;

    if (focused) {
      // Special case: if focusing on root node (depth 0), reset to initial state
      if (node.data.depth === 0) {
        treeHandler.flowHandler.nodes.forEach((n) => {
          if (n.data.depth === 0 || n.data.depth === 1) {
            // Root and first level nodes are focused
            n.data.isFocused = true;
          } else {
            // Deeper levels start minimized but not focused
            n.data.isFocused = false;
          }
        });
      } else {
        // When focusing a non-root node, we need to:
        // 1. Focus this node and its direct children
        // 2. Focus the path from root to this node (ancestors)
        // 3. Unfocus all other minimizable nodes that aren't in this path

        // Get the path from root to this node
        const getPathToRoot = (nodeId: string): string[] => {
          const path = [nodeId];
          const parents = treeHandler.flowHandler.edges
            .filter((edge) => edge.target === nodeId)
            .map((edge) => edge.source);

          parents.forEach((parentId) => {
            path.unshift(...getPathToRoot(parentId));
          });

          return path;
        };

        const pathToRoot = getPathToRoot(nodeId);

        // Get direct children of the focused node
        const directChildren = treeHandler.flowHandler.edges
          .filter((edge) => edge.source === nodeId)
          .map((edge) => edge.target);

        // Nodes that should be focused: path to root + direct children
        const shouldBeFocusedIds = new Set([...pathToRoot, ...directChildren]);

        // Update all nodes
        treeHandler.flowHandler.nodes.forEach((n) => {
          if (n.data.depth === 0) {
            // Root node always stays focused
            n.data.isFocused = true;
          } else if (n.data.depth === 1) {
            // First level children: only focus if they're in the path to the focused node
            n.data.isFocused = shouldBeFocusedIds.has(n.id);
          } else {
            // Deeper levels (originally minimizable): focus only if in path or direct children
            n.data.isFocused = shouldBeFocusedIds.has(n.id);
          }
        });
      }
    } else {
      // When unfocusing, just unfocus this node if it's minimizable
      if (node.data.isMinimized) {
        node.data.isFocused = false;
      }
    }

    // Update layout after focus changes
    setTimeout(() => treeHandler.updateLayout(), 0);
  });

  // Update the node data with the proper handlers
  useMemo(() => {
    treeHandler.flowHandler.nodes.forEach((node) => {
      node.data.setShowingChildren = changeShowingChildren.bind(null, node.id);
      node.data.setFocused = changeFocused.bind(null, node.id);
    });
  }, [treeHandler, changeShowingChildren, changeFocused]);

  return (
    <TreeHandlerContext.Provider value={treeHandler}>
      <ReactFlow
        css={[reactFlowStyle]}
        minZoom={0.2}
        maxZoom={5}
        proOptions={{
          hideAttribution: false,
        }}
        nodes={toJS(treeHandler.nodes)}
        nodeTypes={nodeTypes}
        edges={toJS(treeHandler.edges)}
        zoomOnDoubleClick={false}
        onNodesChange={treeHandler.flowHandler.onNodesChange}
        onEdgesChange={treeHandler.flowHandler.onEdgesChange}
        onConnect={treeHandler.flowHandler.onConnect}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <MiniMap zoomable pannable />
        <Controls showInteractive={false} />
        <Background />
      </ReactFlow>
    </TreeHandlerContext.Provider>
  );
});

export const reactFlowStyle = css({
  '& .react-flow__handle': {
    opacity: 0,
    height: 0,
    width: 0,
  },
  '& .react-flow__handle-left': {
    left: 0,
  },
  '& .react-flow__handle-top': {
    top: 0,
  },
  '& .react-flow__handle-right': {
    right: 0,
  },
  '& .react-flow__handle-bottom': {
    bottom: 0,
  },
});
