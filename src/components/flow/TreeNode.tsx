import { Handle, NodeProps, Position, useNodeId } from 'reactflow';
import { TreeViewData } from '../../data/nodes-edges';
import { Button, Icon } from '@blueprintjs/core';
import { FlexColumn } from '../base/Flex';
import { flex1, fullSize } from '../../styles';
import { observer } from 'mobx-react-lite';
import { useTreeHandler } from '../../models/TreeHandler';

export const treeNodeWidth = 172;
export const treeNodeHeight = 120;
export const minimizedNodeWidth = 60;
export const minimizedNodeHeight = 60;

export interface TreeNodeProps extends NodeProps<TreeViewData> {}

export const TreeNode = observer((props: TreeNodeProps) => {
  const treeHandler = useTreeHandler();

  const nodeId = useNodeId();
  const node = treeHandler.getNodeById(nodeId);

  const childCount = node ? treeHandler.getChildrenCount(node) : 0;
  const descendantsCount = node ? treeHandler.getDescendantsCount(node) : 0;

  const { data, isConnectable } = props;

  const { showingChildren, setShowingChildren, isFocused, setFocused, isMinimized } =
    data;

  // If node should be minimized (either originally minimized OR first-level but not focused), show compact version
  const shouldShowMinimized =
    (isMinimized && !isFocused) || (data.depth === 1 && !isFocused);

  if (shouldShowMinimized) {
    return (
      <button
        css={{
          padding: 8,
          borderRadius: '50%',
          background: data.color ?? '#DDD',
          border: '2px solid #999',
          width: minimizedNodeWidth,
          height: minimizedNodeHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: data.color ? `${data.color}CC` : '#CCC',
            transform: 'scale(1.1)',
          },
          '&:focus': {
            outline: '2px solid #0078d4',
            outlineOffset: '2px',
          },
        }}
        onClick={() => setFocused?.(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setFocused?.(true);
          }
        }}
        aria-label={`Expand node ${data.label}`}
        title={`Click to expand ${data.label}`}
      >
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '10px',
            color: '#666',
          }}
        >
          <div css={{ fontSize: '16px', marginBottom: '2px' }}>⚬</div>
          {childCount > 0 && <div>{childCount}</div>}
        </div>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
      </button>
    );
  }

  // Full expanded view
  const isRootNode = data.depth === 0;

  return (
    <div
      css={{
        padding: 5,
        borderRadius: 3,
        background: data.color ?? '#EEE',
        border: '1px solid black',
        width: treeNodeWidth,
        height: treeNodeHeight,
        cursor: isRootNode ? 'pointer' : 'default',
        '&:hover': isRootNode
          ? {
              background: data.color ? `${data.color}DD` : '#DDD',
            }
          : {},
        '&:focus': isRootNode
          ? {
              outline: '2px solid #0078d4',
              outlineOffset: '2px',
            }
          : {},
      }}
      onClick={isRootNode ? () => setFocused?.(true) : undefined}
      onKeyDown={
        isRootNode
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFocused?.(true);
              }
            }
          : undefined
      }
      role={isRootNode ? 'button' : undefined}
      tabIndex={isRootNode ? 0 : undefined}
      aria-label={isRootNode ? 'Reset tree focus' : undefined}
      title={isRootNode ? 'Click to reset tree focus' : undefined}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <FlexColumn css={[fullSize]}>
        <div css={flex1}>
          <div>{data.label}</div>
          {data.subLabel && <div>{data.subLabel}</div>}

          <div>Children: {childCount}</div>
          <div>Descendants: {descendantsCount}</div>
          {isRootNode && (
            <div css={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
              Click to reset focus
            </div>
          )}
        </div>
        <Button
          css={{ alignSelf: 'center' }}
          small
          minimal
          onClick={() => setShowingChildren?.(!showingChildren)}
          icon={showingChildren ? 'chevron-up' : 'chevron-down'}
        />
      </FlexColumn>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
});
