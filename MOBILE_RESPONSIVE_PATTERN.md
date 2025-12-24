# Mobile Responsive Pattern for Dashboard Tables

This document describes the pattern used to make dashboard pages mobile-responsive, using the Billing page as a reference implementation.

## Problem

Desktop-oriented table layouts don't work well on mobile devices:
- Tables with 5+ columns are impossible to read on small screens
- Horizontal scrolling is awkward on touch devices
- Action buttons are too small and hard to tap
- Information hierarchy is lost in cramped table cells

## Solution: Dual Layout Pattern

Use a **desktop table + mobile cards** approach with Tailwind's responsive classes:

### 1. Desktop Table (hidden on mobile)
```tsx
<div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
    <div className="overflow-x-auto">
        <table className="w-full">
            {/* Existing table code */}
        </table>
    </div>
</div>
```

- `hidden md:block` - Hidden on mobile (<768px), visible on desktop (≥768px)
- Keep all existing desktop table functionality intact

### 2. Mobile Cards (hidden on desktop)
```tsx
<div className="md:hidden space-y-4">
    {items.length > 0 ? items.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            {/* Card Header - Primary info + status */}
            <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                {/* Left: Checkbox + Primary identifier */}
                <div className="flex items-center gap-3">
                    <input type="checkbox" {...checkboxProps} />
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                            Label
                        </div>
                        <div className="text-sm font-black text-gray-900">
                            {item.primaryId}
                        </div>
                    </div>
                </div>
                {/* Right: Status badge */}
                {getStatusBadge(item.status)}
            </div>

            {/* Card Body - Key data points */}
            <div className="px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Field Label
                    </span>
                    <span className="text-lg font-black text-gray-900">
                        {item.value}
                    </span>
                </div>
                {/* Repeat for other important fields */}
            </div>

            {/* Card Actions - Touch-friendly buttons */}
            <div className="px-4 py-3 bg-gray-50/30 border-t border-gray-100 flex items-center gap-2">
                <button className="flex-1 px-4 py-2.5 text-sm bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-bold shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2">
                    <Icon className="w-4 h-4" />
                    Primary Action
                </button>
                <button className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-700 active:scale-95">
                    Secondary
                </button>
                <button className="p-2.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all active:scale-95">
                    <Icon className="w-4 h-4" />
                </button>
            </div>
        </div>
    )) : (
        {/* Empty state */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
                    <Icon className="w-10 h-10 text-gray-200" />
                </div>
                <div className="text-center">
                    <p className="text-xl font-black text-gray-900 mb-1">Empty State Title</p>
                    <p className="text-sm text-gray-400 font-medium">Empty state message</p>
                </div>
            </div>
        </div>
    )}
</div>
```

- `md:hidden` - Visible on mobile (<768px), hidden on desktop (≥768px)
- `space-y-4` - Vertical spacing between cards

## Card Structure Breakdown

### Card Header (Gray Background)
**Purpose**: Show primary identifier and status at a glance

**Layout**:
- Left: Checkbox + Label/ID
- Right: Status badge

**Classes**:
- Container: `px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between`
- Label: `text-[10px] font-black text-gray-400 uppercase tracking-wider`
- Value: `text-sm font-black text-gray-900`

### Card Body (White Background)
**Purpose**: Display key data points in scannable format

**Layout**: Stacked key-value pairs

**Classes**:
- Container: `px-4 py-4 space-y-3`
- Row: `flex items-center justify-between`
- Label: `text-xs font-bold text-gray-400 uppercase tracking-wider`
- Value: `text-lg font-black text-gray-900` (or appropriate size)

### Card Actions (Light Gray Background)
**Purpose**: Touch-friendly action buttons

**Layout**: Horizontal button row with equal flex distribution

**Classes**:
- Container: `px-4 py-3 bg-gray-50/30 border-t border-gray-100 flex items-center gap-2`
- Primary button: `flex-1 px-4 py-2.5 ... active:scale-95`
- Secondary button: `flex-1 px-4 py-2.5 ... active:scale-95`
- Icon-only button: `p-2.5 ... active:scale-95`

**Important**:
- Use `active:scale-95` for touch feedback
- Make buttons at least 44px tall (py-2.5 ≈ 40px + border ≈ 44px)
- Use `flex-1` to make buttons equal width

## Additional Mobile Optimizations

### 1. Responsive Headers
```tsx
<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
    <div>
        <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
            Page Title
        </h1>
        <p className="text-sm md:text-lg text-gray-500 mt-1 md:mt-2 font-medium">
            Subtitle
        </p>
    </div>
    <div className="flex flex-wrap gap-2 md:gap-3">
        {/* Action buttons */}
    </div>
</div>
```

### 2. Responsive Button Text
```tsx
<button className="px-4 md:px-5 py-2.5 md:py-3 ...">
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">Full Text</span>
    <span className="sm:hidden">Short</span>
</button>
```

### 3. Summary Cards (Already Responsive)
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Cards */}
</div>
```

## Tailwind Breakpoints Used

- `sm:` 640px+ - Small phones to tablets
- `md:` 768px+ - Tablets to desktop (main breakpoint)
- `lg:` 1024px+ - Desktop

**Primary breakpoint**: `md:` (768px)
- Mobile: < 768px
- Desktop: ≥ 768px

## Implementation Checklist

When making a page responsive:

- [ ] Wrap desktop table in `hidden md:block` container
- [ ] Create mobile cards section with `md:hidden` container
- [ ] Structure each card with Header/Body/Actions sections
- [ ] Use proper text sizes (`text-xs` labels, `text-lg` values)
- [ ] Add touch feedback (`active:scale-95`)
- [ ] Make buttons touch-friendly (min 44px height)
- [ ] Include empty state for mobile cards
- [ ] Test on actual mobile device
- [ ] Verify header is responsive
- [ ] Ensure button text adapts or abbreviates

## Files Modified

**Billing Page Example**:
- `/media/storage/dev/StudioSync/frontend/app/dashboard/billing/page.tsx`

**Changes**:
1. Line ~277: Added `hidden md:block` to table container
2. Lines 371-445: Added mobile cards section
3. Lines 208-233: Made header responsive

## Touch Interaction Guidelines

1. **Minimum tap target**: 44x44px (Apple HIG, Material Design)
2. **Visual feedback**: Use `active:scale-95` for press effect
3. **Spacing**: `gap-2` minimum between touch targets
4. **Button padding**: `py-2.5` minimum (with `text-sm`)

## Accessibility Notes

- Maintain same functionality on mobile and desktop
- Ensure color contrast ratios meet WCAG standards
- Keep ARIA labels consistent
- Form inputs should be large enough (min 44px)
- Status badges should have sufficient contrast

## Performance Considerations

- No duplication of data fetching
- Both layouts use same data/state
- CSS-only show/hide (no conditional rendering)
- No JS required for responsiveness
- Minimal bundle size impact

## Future Improvements

1. **Swipe Actions**: Add swipe-to-delete/archive on mobile cards
2. **Pull to Refresh**: Implement mobile refresh pattern
3. **Infinite Scroll**: Better than pagination on mobile
4. **Skeleton Loading**: Mobile-specific loading states
5. **Offline Support**: PWA features for mobile

## Testing

Test on these viewports:
- iPhone SE: 375x667
- iPhone 12/13: 390x844
- iPhone 14 Pro Max: 430x932
- iPad: 768x1024
- iPad Pro: 1024x1366

## Common Pitfalls

❌ **Don't**:
- Use horizontal scroll on mobile
- Make buttons smaller than 44px
- Hide important information on mobile
- Use hover states as only interaction
- Forget touch feedback (`active:scale-95`)

✅ **Do**:
- Prioritize content on mobile
- Use touch-friendly sizes
- Provide visual feedback
- Test on real devices
- Keep mobile-first mindset

---

**Template Last Updated**: 2024
**Reference Implementation**: Billing Page
**Status**: ✅ Production Ready
