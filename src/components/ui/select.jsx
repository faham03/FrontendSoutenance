"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef(({ children, value, onValueChange, required, ...props }, ref) => {
  return (
    <div className="relative" ref={ref} {...props}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { value, onValueChange })
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, { value, onValueChange })
        }
        return child
      })}
    </div>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ children, className, value, onValueChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md">
            {React.Children.map(props.children, (child) => {
              if (child?.type === SelectContent) {
                return React.cloneElement(child, {
                  value,
                  onValueChange: (newValue) => {
                    onValueChange?.(newValue)
                    setIsOpen(false)
                  },
                })
              }
              return null
            })}
          </div>
        </>
      )}
    </>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ placeholder, className, ...props }, ref) => {
  return (
    <span ref={ref} className={className} {...props}>
      {props.children || placeholder}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ children, value, onValueChange, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {React.Children.map(children, (child) => {
        if (child?.type === SelectItem) {
          return React.cloneElement(child, {
            isSelected: child.props.value === value,
            onSelect: () => onValueChange?.(child.props.value),
          })
        }
        return child
      })}
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ children, className, isSelected, onSelect, ...props }, ref) => {
  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
        isSelected ? "bg-accent" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
