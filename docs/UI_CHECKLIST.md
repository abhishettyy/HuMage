# ✈️ Flight Deck UI Checklist

Before opening a pull request for a UI component, please ensure it meets the "Flight Deck" design metaphor outlined in `UI-DESIGN.md`. 

This checklist helps maintain consistency across the dashboard as multiple people build the frontend!

## 1. 🎨 Colors & Theming
- [ ] Are you strictly using the Teal (Present), Amber (Absent/Delayed), and Gray (On Leave) color ramp?
- [ ] Did you avoid using red except for strictly destructive actions (like deleting an employee)?
- [ ] Is text placed on colored badges easily readable? (Always use the 800/900 stop of the color ramp for text, never plain black on colored backgrounds).

## 2. 📝 Typography
- [ ] Is standard text using the system Sans-Serif font?
- [ ] Are all identifiers (Login IDs) and numbers (Salaries, Timestamps, Percentages) using a **Monospace** font?
- [ ] Are all labels in sentence case? (Except for the literal "NEW" button).

## 3. 🧩 Components
- [ ] Do all employee cards feature the correct 24x24 SVG status dot in the corner?
- [ ] Are the card corners rounded to exactly 12px? (Badges/pills should be 6px, buttons 8px).
- [ ] Does the card have a dashed divider (perforation effect) separating the top from the footer strip?
- [ ] Are you using the correct Tabler SVG icons (`plane-departure`, `alert-circle`, `plane`, `clock`) from the `assets` folder?

## 4. 📐 Layout & Spacing
- [ ] Are you using the standard spacing scale (4 / 8 / 16 / 24 / 32px)?
- [ ] Is the card internal padding exactly 16px?
- [ ] Are tables/lists dense rather than padded, allowing HR to scan data quickly without scrolling?

## 5. 🛠️ Empty & Loading States
- [ ] Do your components have a skeleton loading state (rather than a spinner)?
- [ ] Are empty states calm and factual (e.g., "No leave requests yet") with a primary action button visible if applicable?

---
*If you are unsure about any of these, refer back to the single source of truth: `UI-DESIGN.md`.*
