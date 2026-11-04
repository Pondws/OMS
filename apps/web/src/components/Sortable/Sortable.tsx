"use client"

import {
  DragDropProvider,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/react"

import { useSortable } from "@dnd-kit/react/sortable"
import { GripVertical } from "lucide-react"
import { useState } from "react"

type SortableListProps<T> = {
  items: T[]
  getId: (item: T) => string
  onMove: (oldIndex: number, newIndex: number) => void
  renderItem: (item: T, index: number) => React.ReactNode
}

type SortableItemProps = {
  id: string
  index: number
  children: React.ReactNode
}

export function SortableList<T>({
  items,
  getId,
  onMove,
  renderItem,
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.operation.source?.id))
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null)

    const { source, target } = e.operation

    if (!target || source?.id === target.id) {
      return
    }

    const oldIndex = items.findIndex(
      (item) => getId(item) === source?.id
    )

    const newIndex = items.findIndex(
      (item) => getId(item) === target.id
    )

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    onMove(oldIndex, newIndex)
  }

  const activeIndex = items.findIndex(
    (item) => getId(item) === activeId
  )

  const activeItem =
    activeIndex !== -1 ? items[activeIndex] : null

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col w-full gap-3">
        {items.map((item, index) => (
          <SortableItem
            key={getId(item)}
            id={getId(item)}
            index={index}
          >
            {renderItem(item, index)}
          </SortableItem>
        ))}
      </div>

      <DragOverlay>
        {activeItem && (
          <div className="flex w-full items-center gap-2">
            <GripVertical className="shrink-0 cursor-grabbing" />

            <div className="min-w-0 flex-1">
              {renderItem(activeItem, activeIndex)}
            </div>
          </div>
        )}
      </DragOverlay>
    </DragDropProvider>
  )
}

export function SortableItem({
  id,
  index,
  children,
}: SortableItemProps) {
  const { ref } = useSortable({
    id,
    index,
  })

  return (
    <div
      ref={ref}
      className="flex w-full items-center gap-2"
    >
      <GripVertical className="shrink-0 cursor-grab" />

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  )
}