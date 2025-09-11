import dagre from 'dagre';
import { Edge, Node, Position } from 'reactflow';

export enum Direction {
  Vertical = 'TB',
  Horizontal = 'LR',
}

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: Direction,
  getNodeDimensions: (node: Node) => { width: number; height: number },
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 20, // Horizontal spacing between nodes at the same rank
    ranksep: 50, // Vertical spacing between ranks (levels)
    marginx: 20, // Horizontal margin around the graph
    marginy: 20, // Vertical margin around the graph
  });

  nodes.forEach((node) => {
    const { width, height } = getNodeDimensions(node);
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const { width, height } = getNodeDimensions(node);

    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2,
    };

    return node;
  });

  return { nodes, edges };
}
