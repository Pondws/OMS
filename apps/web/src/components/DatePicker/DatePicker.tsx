"use client"

import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar,
  Button,
  Select
} from "components"
import { DATETYPE_OPTION } from "consts"
import type { DateRange } from "react-day-picker"

type DateRangeChange = {
  startDate: string
  endDate: string
}

type DatePickerProps = {
  dateTypeValue: string
  onDateTypeChange: (value: string) => void
  startDate: string
  endDate: string
  onDateRangeChange: (value: DateRangeChange) => void
}

// export function DatePicker({
//   dateTypeValue,
//   onDateTypeChange,
//   startDate,
//   endDate,
//   onDateRangeChange
// }: DatePickerProps) {
//   const [open, setOpen] = useState(false)
//   const [dateRange, setDateRange] = useState<DateRange | undefined>({
//     from: startDate ? new Date(startDate) : undefined,
//     to: endDate ? new Date(endDate) : undefined,
//   })

//   const handleOpenChange = (value: boolean) => {
//     setOpen(value)

//     // กำลังปิด
//     if (!value && dateRange?.from && dateRange?.to) {
//       onDateRangeChange({
//         startDate: dateRange.from.toISOString(),
//         endDate: dateRange.to.toISOString(),
//       })
//     }
//   }

//   return (
//     <div className="flex">
//       <Select
//         className={"w-36 justify-between font-normal border-r-0 rounded-r-none"}
//         options={DATETYPE_OPTION}
//         value={dateTypeValue}
//         onChange={(value) => {
//           if (value) {
//             onDateTypeChange(value)
//           }
//         }}
//       />

//       <Popover open={open} onOpenChange={handleOpenChange}>
//         <PopoverTrigger
//           render={
//             <Button
//               variant="outline"
//               id="date"
//               className="w-56 justify-between rounded-l-none font-normal"
//             />
//           }
//         >
//           {dateRange?.from ? (
//             <>
//               {dateRange.from.toLocaleDateString()}
//               {dateRange.to && (
//                 <> - {dateRange.to.toLocaleDateString()}</>
//               )}
//             </>
//           ) : (
//             "เลือกวันที่"
//           )}
//         </PopoverTrigger>
//         <PopoverContent className="w-auto overflow-hidden p-0" align="start">
//           <Calendar
//             mode="range"
//             defaultMonth={dateRange?.from}
//             numberOfMonths={2}
//             selected={dateRange}
//             onSelect={setDateRange}
//             className="rounded-lg border shadow-sm"
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   )
// }

export function DatePicker({
  dateTypeValue,
  onDateTypeChange,
  startDate,
  endDate,
  onDateRangeChange,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  })

  const handleOpenChange = (value: boolean) => {
    setOpen(value)

    // กำลังปิด
    if (!value && dateRange?.from && dateRange?.to) {
      onDateRangeChange({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      })
    }
  }

  return (
    <div className="flex">
      <Select
        className="w-36 justify-between font-normal border-r-0 rounded-r-none"
        options={DATETYPE_OPTION}
        value={dateTypeValue}
        onChange={(value) => {
          if (value) {
            onDateTypeChange(value)
          }
        }}
      />

      <Popover
        open={open}
        onOpenChange={handleOpenChange}
      >
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id="date"
              className="w-56 justify-between rounded-l-none font-normal"
            />
          }
        >
          {dateRange?.from ? (
            <>
              {dateRange.from.toLocaleDateString()}
              {dateRange.to && (
                <> - {dateRange.to.toLocaleDateString()}</>
              )}
            </>
          ) : (
            "เลือกวันที่"
          )}
        </PopoverTrigger>

        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="start"
        >
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            numberOfMonths={2}
            selected={dateRange}
            onSelect={setDateRange}
            className="rounded-lg border shadow-sm"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}