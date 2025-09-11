import { Node, Edge } from 'reactflow';
import { NodeType } from '../components/flow/DagreTree';

const position = { x: 0, y: 0 };
const edgeType = 'smoothstep';

export interface TreeData {
  label: string;
  subLabel?: string;
  color?: string;
}

export interface TreeViewData extends TreeData {
  showingChildren: boolean;
  setShowingChildren?(showingChildren: boolean): void;
  isFocused: boolean;
  setFocused?(focused: boolean): void;
  isMinimized: boolean;
  depth: number;
}

export interface TreeNode {
  id: string;
  data: TreeData;
  children?: TreeNode[];
}

export const tree: TreeNode = {
  id: '1',
  data: { label: 'Root Node', subLabel: 'Main Entry', color: '#4CAF50' },
  children: [
    {
      id: '2',
      data: { label: 'Processing Branch', subLabel: 'Data Flow', color: '#2196F3' },
      children: [
        {
          id: '2a',
          data: { label: 'Validation', subLabel: 'Input Check', color: '#FF9800' },
          children: [
            { id: '2a1', data: { label: 'Schema Check', color: '#FFEB3B' } },
            { id: '2a2', data: { label: 'Type Validation', color: '#FFEB3B' } },
            {
              id: '2a3',
              data: { label: 'Business Rules', color: '#FFEB3B' },
              children: [
                { id: '2a3i', data: { label: 'Rule Engine', color: '#E1BEE7' } },
                { id: '2a3ii', data: { label: 'Custom Logic', color: '#E1BEE7' } },
              ],
            },
          ],
        },
        {
          id: '2b',
          data: { label: 'Transformation', subLabel: 'Data Mapping', color: '#FF9800' },
          children: [
            { id: '2b1', data: { label: 'Format Conversion', color: '#FFEB3B' } },
            { id: '2b2', data: { label: 'Field Mapping', color: '#FFEB3B' } },
            { id: '2b3', data: { label: 'Enrichment', color: '#FFEB3B' } },
          ],
        },
        {
          id: '2c',
          data: { label: 'Processing Core', subLabel: 'Main Logic', color: '#FF9800' },
          children: [
            {
              id: '2c1',
              data: { label: 'Algorithm A', color: '#FFEB3B' },
              children: [
                { id: '2c1i', data: { label: 'Step 1', color: '#E1BEE7' } },
                { id: '2c1ii', data: { label: 'Step 2', color: '#E1BEE7' } },
                { id: '2c1iii', data: { label: 'Step 3', color: '#E1BEE7' } },
              ],
            },
            {
              id: '2c2',
              data: { label: 'Algorithm B', color: '#FFEB3B' },
              children: [
                { id: '2c2i', data: { label: 'Optimization', color: '#E1BEE7' } },
                { id: '2c2ii', data: { label: 'Calculation', color: '#E1BEE7' } },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '3',
      data: { label: 'Logging Branch', subLabel: 'Audit Trail', color: '#9C27B0' },
      children: [
        { id: '3a', data: { label: 'Error Logging', color: '#F44336' } },
        { id: '3b', data: { label: 'Activity Log', color: '#795548' } },
        {
          id: '3c',
          data: { label: 'Metrics', color: '#607D8B' },
          children: [
            { id: '3c1', data: { label: 'Performance', color: '#9E9E9E' } },
            { id: '3c2', data: { label: 'Usage Stats', color: '#9E9E9E' } },
          ],
        },
      ],
    },
    {
      id: '4',
      data: { label: 'Output Branch', subLabel: 'Results', color: '#FF5722' },
      children: [
        {
          id: '4a',
          data: { label: 'Formatting', subLabel: 'Output Prep', color: '#FFC107' },
          children: [
            { id: '4a1', data: { label: 'JSON Output', color: '#8BC34A' } },
            { id: '4a2', data: { label: 'XML Output', color: '#8BC34A' } },
            { id: '4a3', data: { label: 'CSV Output', color: '#8BC34A' } },
          ],
        },
        {
          id: '4b',
          data: { label: 'Delivery', subLabel: 'Transport', color: '#FFC107' },
          children: [
            {
              id: '4b1',
              data: { label: 'API Response', color: '#8BC34A' },
              children: [
                { id: '4b1i', data: { label: 'REST', color: '#CDDC39' } },
                { id: '4b1ii', data: { label: 'GraphQL', color: '#CDDC39' } },
              ],
            },
            {
              id: '4b2',
              data: { label: 'File Export', color: '#8BC34A' },
              children: [
                { id: '4b2i', data: { label: 'Local Storage', color: '#CDDC39' } },
                { id: '4b2ii', data: { label: 'Cloud Storage', color: '#CDDC39' } },
                { id: '4b2iii', data: { label: 'FTP Transfer', color: '#CDDC39' } },
              ],
            },
            { id: '4b3', data: { label: 'Database Store', color: '#8BC34A' } },
          ],
        },
      ],
    },
    {
      id: '5',
      data: { label: 'Notification Branch', subLabel: 'Alerts', color: '#E91E63' },
      children: [
        { id: '5a', data: { label: 'Email Alerts', color: '#3F51B5' } },
        { id: '5b', data: { label: 'SMS Alerts', color: '#3F51B5' } },
        {
          id: '5c',
          data: { label: 'Push Notifications', color: '#3F51B5' },
          children: [
            { id: '5c1', data: { label: 'Mobile App', color: '#009688' } },
            { id: '5c2', data: { label: 'Web Browser', color: '#009688' } },
          ],
        },
      ],
    },
  ],
};

export function convertTreeNodeToNodesAndEdges(
  treeNode: TreeNode,
  changeShowingChildren: (nodeId: string, showChildren: boolean) => void,
  changeFocused: (nodeId: string, focused: boolean) => void,
): {
  nodes: Node<TreeViewData>[];
  edges: Edge[];
} {
  const nodes: Node<TreeViewData>[] = [];
  const edges: Edge[] = [];

  function traverse(node: TreeNode, parent?: TreeNode, depth = 0) {
    // Root node and first level children are focused by default
    // Deeper levels (depth >= 2) start minimized unless they are focused
    const isInitiallyFocused = depth <= 1;
    const isMinimized = depth >= 2;

    nodes.push({
      id: node.id,
      data: {
        showingChildren: true, // Everything starts expanded
        setShowingChildren: (showingChildren: boolean) => {
          changeShowingChildren(node.id, showingChildren);
        },
        isFocused: isInitiallyFocused,
        setFocused: (focused: boolean) => {
          changeFocused(node.id, focused);
        },
        isMinimized,
        depth,
        ...node.data,
      },
      position,
      draggable: false,
      deletable: false,
      type: NodeType.TreeNode,
    });

    if (parent) {
      edges.push({
        id: `e${parent.id}${node.id}`,
        source: parent.id,
        target: node.id,
        type: edgeType,
        animated: false,
        // markerEnd: {
        //   type: MarkerType.ArrowClosed,
        // },
      });
    }

    if (node.children) {
      node.children.forEach((child) => traverse(child, node, depth + 1));
    }
  }

  traverse(treeNode);

  return { nodes, edges };
}
