# MatchFlow AI Design System

## Colors

A restrained neutral foundation, using semantic colors meaningfully:

- **background**: `#F8FAFC` (slate-50)
- **surface**: `#FFFFFF` (white)
- **surface-muted**: `#F1F5F9` (slate-100)
- **border**: `#E2E8F0` (slate-200)
- **foreground**: `#0F172A` (slate-900)
- **foreground-muted**: `#475569` (slate-600)
- **primary**: `#0F172A` (slate-900 - professional/modern feel)
- **primary-hover**: `#1E293B` (slate-800)
- **success**: `#10B981` (emerald-500) - high compatibility
- **warning**: `#F59E0B` (amber-500) - risk / warning
- **danger**: `#EF4444` (red-500) - error / strong mismatch

## Typography

- **Heading Font**: Geist / Inter (Existing font system from Next.js)
- **Body Font**: Geist / Inter

Hierarchy:
- **Page Title**: 28–32px / semibold (`text-3xl font-semibold`)
- **Section Heading**: 18–20px / semibold (`text-xl font-semibold`)
- **Card Heading**: 14–16px / medium or semibold (`text-base font-medium`)
- **Body**: 14px (`text-sm`)
- **Metadata**: 12–13px (`text-xs text-muted-foreground`)

## Spacing

Scale:
- `4px` (`p-1`, `gap-1`)
- `8px` (`p-2`, `gap-2`)
- `12px` (`p-3`, `gap-3`)
- `16px` (`p-4`, `gap-4`)
- `20px` (`p-5`, `gap-5`)
- `24px` (`p-6`, `gap-6`)
- `32px` (`p-8`, `gap-8`)
- `40px` (`p-10`, `gap-10`)
- `48px` (`p-12`, `gap-12`)

## Radius

- **Standard**: `8px` (`rounded-lg`)
- **Cards/Containers**: `12px` (`rounded-xl`)

## Borders / Shadows

- **Borders**: Subtle borders (`border border-slate-200`)
- **Shadows**: Use sparingly (`shadow-sm` for standard cards, `shadow-md` for floating elements). Professional SaaS relies mostly on spacing, contrast, typography, and borders rather than heavy shadows.
