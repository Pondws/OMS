"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ImageUp, Loader2, RefreshCw, X } from "lucide-react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"

export type ImageUploadValue = {
  /** Image src — an uploaded URL or a `blob:` preview of a picked file. Must be unique. */
  url: string
  alt?: string
}

export type ImageUploadProps = {
  /**
   * Images to show. Single: the first one fills the square in place of the drop zone.
   * Multiple: shown as squares to the left of the drop zone.
   * Extra fields (e.g. `path`) are fine, so form values can be passed as-is.
   */
  value?: ImageUploadValue[]
  /** Called with the picked files (always one file when `multiple` is false). */
  onSelect: (files: File[]) => void
  /** Shows a remove button on each image. */
  onRemove?: (index: number) => void
  /** Multiple only: enables drag-to-reorder. Use `arrayMove(value, from, to)`. */
  onReorder?: (from: number, to: number) => void
  /** Allow picking several files at once. Default false (single). */
  multiple?: boolean
  /** Cap for `multiple` (e.g. remaining slots); extra files are dropped. 0 hides the drop zone. */
  maxFiles?: number
  /** `accept` attribute, e.g. "image/jpeg,image/png,image/webp". Also applied to dropped files. */
  accept?: string
  disabled?: boolean
  /** Shows a busy state while the caller uploads. */
  uploading?: boolean
  /** Field label shown above, like Input. */
  label?: React.ReactNode
  /** Main line inside the drop zone. */
  placeholder?: React.ReactNode
  /** Text under the field, like Input. Turns red when `error`. */
  helperText?: React.ReactNode
  /** Switches every primary color to the destructive color. */
  error?: boolean
  /** Main line while `uploading`. */
  uploadingLabel?: React.ReactNode
  /** Secondary line, e.g. "JPEG, PNG or WebP, up to 5 MB". */
  hint?: React.ReactNode
  /** Badge on the first image in `multiple` mode, e.g. "Cover". */
  primaryBadge?: React.ReactNode
  /** Size classes for every square tile. Default "size-32". */
  tileClassName?: string
  id?: string
  className?: string
}

/** Same rules as the `accept` attribute: "image/*", "image/png", ".webp". */
const matchesAccept = (file: File, accept: string) =>
  accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule)
      if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1))
      return file.type === rule
    })

// Literal class strings so Tailwind can see them
const TONES = {
  primary: {
    border: "border-primary/20",
    hover: "hover:bg-primary/5",
    dragging: "group-data-dragging:bg-primary/10",
    outer: "bg-primary/10",
    inner: "bg-primary/20",
    icon: "text-primary",
    badge: "bg-primary text-primary-foreground",
  },
  error: {
    border: "border-destructive/50",
    hover: "hover:bg-destructive/5",
    dragging: "group-data-dragging:bg-destructive/10",
    outer: "bg-destructive/10",
    inner: "bg-destructive/20",
    icon: "text-destructive",
    badge: "bg-destructive text-white",
  },
} as const

const iconButton = cn(
  "absolute z-10 cursor-pointer rounded-full bg-background/80 p-1 shadow-sm",
  "hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:pointer-events-none disabled:opacity-50"
)

const previewButton = cn(
  "block size-full cursor-pointer",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
)

type Activator = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref: (el: HTMLElement | null) => void
}

/** A tile that can be dragged by its activator (the image button). */
function SortableTile({
  id,
  disabled,
  className,
  children,
}: {
  id: string
  disabled: boolean
  className: string
  children: (activator: Activator) => React.ReactNode
}) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id, disabled })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(className, isDragging && "z-20 opacity-80 shadow-lg")}
    >
      {children({
        ref: setActivatorNodeRef,
        ...(attributes as React.ButtonHTMLAttributes<HTMLButtonElement>),
        ...listeners,
      })}
    </div>
  )
}

/** Full-screen preview on a native <dialog> (Esc closes, focus is trapped). */
function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: ImageUploadValue[]
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const current = index !== null ? images[index] : undefined

  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (current && !dialog.open) dialog.showModal()
    if (!current && dialog.open) dialog.close()
  }, [current])

  const go = (step: number) => {
    if (index === null || images.length < 2) return
    onIndexChange((index + step + images.length) % images.length)
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Clicking the backdrop (the dialog itself, not its content) closes it
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1)
        if (e.key === "ArrowLeft") go(-1)
      }}
      className="m-auto max-h-none max-w-none overflow-visible bg-transparent p-0 backdrop:bg-black/80"
    >
      {current && index !== null && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={current.alt ?? `Image ${index + 1}`}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
          />

          <button
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className={cn(iconButton, "right-2 top-2 p-1.5")}
          >
            <X className="size-4" aria-hidden />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => go(-1)}
                className={cn(iconButton, "left-2 top-1/2 -translate-y-1/2 p-1.5")}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => go(1)}
                className={cn(iconButton, "right-2 top-1/2 -translate-y-1/2 p-1.5")}
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-2 py-0.5 text-xs">
                {index + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      )}
    </dialog>
  )
}

/**
 * Click-or-drop image picker with square previews. It only selects files — uploading and
 * errors belong to the caller, which also owns `value`, so the same component works for
 * a single cover image and for a gallery. Click an image to preview it; in `multiple`
 * mode with `onReorder`, drag images to reorder them.
 */
export function ImageUpload({
  value = [],
  onSelect,
  onRemove,
  onReorder,
  multiple = false,
  maxFiles,
  accept = "image/jpeg,image/png,image/webp",
  disabled = false,
  uploading = false,
  label,
  placeholder,
  helperText,
  error = false,
  uploadingLabel = "Uploading…",
  hint,
  primaryBadge,
  tileClassName = "size-32",
  id,
  className,
}: ImageUploadProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const [dragging, setDragging] = React.useState(false)
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null)
  const inactive = disabled || uploading
  const tone = error ? TONES.error : TONES.primary

  const sensors = useSensors(
    // 5px before a drag starts, so a plain click still opens the preview
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      // Enter opens the preview; Space picks up / drops
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space", "Enter"] },
    })
  )

  const pick = (list: FileList | null) => {
    if (!list || inactive) return
    // Dropped files skip the input's `accept`, so filter here too
    const accepted = Array.from(list).filter((file) => matchesAccept(file, accept))
    const files = multiple ? accepted.slice(0, maxFiles ?? accepted.length) : accepted.slice(0, 1)
    if (files.length > 0) onSelect(files)
  }

  const ids = value.map((image) => image.url)
  const sortable = multiple && !!onReorder && !inactive && value.length > 1

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!onReorder || !over || active.id === over.id) return
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from !== -1 && to !== -1) onReorder(from, to)
  }

  const tile = cn("relative shrink-0 aspect-square overflow-hidden rounded-lg", tileClassName)

  const removeButton = (index: number) =>
    onRemove && (
      <button
        type="button"
        aria-label="Remove image"
        disabled={inactive}
        // Don't let the press start a drag on the tile
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onRemove(index)}
        className={cn(iconButton, "right-1 top-1")}
      >
        <X className="size-3.5" aria-hidden />
      </button>
    )

  const singleImage = !multiple ? value[0] : undefined
  const showDropZone = !multiple || maxFiles === undefined || maxFiles > 0
  const labelClass = cn("text-sm font-medium leading-none", error && "text-destructive")

  return (
    <div data-slot="image-upload" className={cn("flex flex-col gap-2", className)}>
      {label &&
        (showDropZone ? (
          <label htmlFor={inputId} className={labelClass}>
            {label}
          </label>
        ) : (
          // No input when the drop zone is hidden, so nothing to point at
          <span className={labelClass}>{label}</span>
        ))}

      <div className="flex flex-wrap gap-3">
        {/* Multiple: images on the left, drag to reorder */}
        {multiple && value.length > 0 && (
          <DndContext
            id={`${inputId}-dnd`} // stable ids for SSR hydration
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={ids} strategy={rectSortingStrategy}>
              {value.map((image, index) => (
                <SortableTile
                  key={image.url}
                  id={image.url}
                  disabled={!sortable}
                  className={cn(tile, "border")}
                >
                  {(activator) => (
                    <>
                      <button
                        type="button"
                        aria-label={`Preview image ${index + 1}`}
                        {...activator}
                        onClick={() => setPreviewIndex(index)}
                        className={cn(previewButton, sortable && "cursor-grab active:cursor-grabbing")}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt={image.alt ?? `Image ${index + 1}`}
                          draggable={false}
                          className="size-full object-cover"
                        />
                      </button>
                      {index === 0 && primaryBadge && (
                        <span
                          className={cn(
                            "pointer-events-none absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
                            tone.badge
                          )}
                        >
                          {primaryBadge}
                        </span>
                      )}
                      {removeButton(index)}
                    </>
                  )}
                </SortableTile>
              ))}
            </SortableContext>
          </DndContext>
        )}

        {showDropZone && (
          <div
            data-dragging={dragging || undefined}
            onDragOver={(e) => {
              e.preventDefault()
              if (!inactive) setDragging(true)
            }}
            onDragLeave={(e) => {
              // Moving onto a child (icon, text) fires dragleave too — ignore it
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false)
            }}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              pick(e.dataTransfer.files)
            }}
            className={cn(tile, "group", singleImage && "border", singleImage && error && "border-destructive")}
          >
            {singleImage ? (
              // Single: the image replaces the drop zone; click to preview, ↻ or drop to replace
              <>
                <button
                  type="button"
                  aria-label="Preview image"
                  onClick={() => setPreviewIndex(0)}
                  className={previewButton}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={singleImage.url}
                    alt={singleImage.alt ?? "Image"}
                    draggable={false}
                    className="size-full object-cover"
                  />
                </button>

                {!inactive && (
                  <label
                    htmlFor={inputId}
                    aria-label="Replace image"
                    title="Replace image"
                    className={cn(iconButton, "bottom-1 right-1")}
                  >
                    <RefreshCw className="size-3.5" aria-hidden />
                  </label>
                )}

                {uploading && (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                  </span>
                )}
                {removeButton(0)}
              </>
            ) : (
              <label
                htmlFor={inputId}
                aria-disabled={inactive || undefined}
                aria-busy={uploading || undefined}
                className={cn(
                  "flex size-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-2 text-center text-sm",
                  "focus-within:ring-2 focus-within:ring-ring",
                  "aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-transparent",
                  tone.border,
                  tone.hover,
                  tone.dragging
                )}
              >
                {/* Icon inside two circles */}
                <span
                  className={cn("flex size-11 items-center justify-center rounded-full", tone.outer)}
                  aria-hidden
                >
                  <span className={cn("flex size-8 items-center justify-center rounded-full", tone.inner)}>
                    {uploading ? (
                      <Loader2 className={cn("size-4 animate-spin", tone.icon)} />
                    ) : (
                      <ImageUp className={cn("size-4", tone.icon)} />
                    )}
                  </span>
                </span>
                <span className="font-medium leading-tight">
                  {uploading
                    ? uploadingLabel
                    : (placeholder ?? (multiple ? "Upload images" : "Upload an image"))}
                </span>
                {hint && <span className="text-xs leading-tight text-muted-foreground">{hint}</span>}
              </label>
            )}

            <input
              id={inputId}
              type="file"
              accept={accept}
              multiple={multiple}
              disabled={inactive}
              className="sr-only"
              onChange={(e) => {
                pick(e.currentTarget.files)
                // Picking the same file again must fire onChange again
                e.currentTarget.value = ""
              }}
            />
          </div>
        )}
      </div>

      {helperText && (
        <p className={cn("text-sm", error ? "text-destructive" : "text-muted-foreground")}>
          {helperText}
        </p>
      )}

      <Lightbox
        images={value}
        index={previewIndex}
        onIndexChange={setPreviewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    </div>
  )
}
