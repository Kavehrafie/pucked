import React, {CSSProperties} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/core';
import {AnimateLayoutChanges, useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {TreeItem, Props as TreeItemProps} from './TreeItem';
import {iOS} from '../utilities';

interface Props extends Omit<TreeItemProps, 'translations' | 'pageSlug' | 'onClick'> {
  id: UniqueIdentifier;
  translations?: TreeItemProps['translations'];
  pageSlug?: string;
  onClick?: TreeItemProps['onClick'];
}

const animateLayoutChanges: AnimateLayoutChanges = ({isSorting, wasDragging}) =>
  !(isSorting || wasDragging);

export function SortableTreeItem({id, depth, translations, pageSlug, onClick, ...props}: Props) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      ghost={isDragging}
      disableSelection={iOS}
      disableInteraction={isSorting}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      translations={translations}
      pageSlug={pageSlug}
      onClick={onClick}
      {...props}
    />
  );
}