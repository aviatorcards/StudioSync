# Plan: Redesign Popup Dialog and Landing Page Color Scheme

This plan outlines the steps to redesign the popup dialog (`Modal.tsx`) to be more modern, clean, and functional for both desktop and mobile displays. It also includes a task to update the color scheme of the landing pages to use more earth tones.

## 1. Redesign Popup Dialog

### 1.1. Analyze Existing Modal Component

- **File:** `frontend/components/Modal.tsx`
- **Goal:** Understand the current implementation, including its props, structure, styling (Tailwind CSS), and any existing logic for handling state (e.g., open/close).
- **Actions:**
    - Read and analyze the `Modal.tsx` file.
    - Identify how it's being used in other components.

### 1.2. Propose a New Design

- **Goal:** Create a design that is modern, clean, and functional.
- **Key Considerations:**
    - **Visuals:** Use a card-based design with a backdrop/overlay. Employ a subtle entry/exit animation (e.g., fade-in, scale-up).
    - **Header, Body, Footer:** Define clear sections for the modal's content.
    - **Actions:** The modal should have a primary action button and a secondary action button (e.g., "Save" and "Cancel").
    - **Responsiveness:** The modal should be responsive and adapt to different screen sizes. On mobile, it should probably be a full-screen or bottom-sheet style dialog.
    - **Accessibility:** The modal should be accessible, with features like focus trapping, keyboard navigation (e.g., closing with the Escape key), and ARIA attributes.

### 1.3. Implement the New Design

- **File:** `frontend/components/Modal.tsx`
- **Goal:** Update the `Modal.tsx` component with the new design.
- **Actions:**
    - Update the JSX to reflect the new structure (header, body, footer).
    - Use Tailwind CSS to style the component according to the new design.
    - Use a library like `framer-motion` for animations.
    - Implement the accessibility features.

### 1.4. Update Components Using the Modal

- **Goal:** Identify and update all components that use the `Modal.tsx` component.
- **Actions:**
    - Search the codebase for instances where `Modal.tsx` is used.
    - Update the props passed to the `Modal` component to match the new design.
    - Ensure that the content passed to the modal is correctly structured (header, body, footer).

### 1.5. Test the New Design

- **Goal:** Ensure that the new modal design works as expected across different browsers and devices.
- **Actions:**
    - Manually test the modal on desktop and mobile browsers.
    - Test the modal's responsiveness by resizing the browser window.
    - Test the accessibility features (keyboard navigation, screen readers).
    - Verify that all components using the modal are still working correctly.

## 2. Redesign Landing Page Color Scheme

### 2.1. Analyze Existing Color Scheme

- **Goal:** Identify the files where the orange and purple colors are being used.
- **Actions:**
    - Analyze `frontend/tailwind.config.js` to see the defined color palette.
    - Search for the color class names (e.g., `bg-orange-500`, `text-purple-600`) in the `frontend/app` directory to find where they are used.

### 2.2. Propose a New Color Palette

- **Goal:** Create a new color palette based on earth tones.
- **Proposed Palette:**
    - **Primary:** A warm, earthy orange (e.g., terracotta, burnt sienna).
    - **Secondary:** A complementary neutral color (e.g., beige, sand, or a warm gray).
    - **Accent:** A muted, earthy green or blue.
- **Actions:**
    - Present the proposed color palette to the user for approval.

### 2.3. Implement the New Color Palette

- **Goal:** Update the application with the new color palette.
- **Actions:**
    - Update the `frontend/tailwind.config.js` file with the new colors.
    - Replace the old color class names with the new ones in the relevant files.

### 2.4. Test the New Color Scheme

- **Goal:** Ensure that the new colors are applied correctly and that the overall design is harmonious.
- **Actions:**
    - Review the landing pages and any other affected pages to check the new color scheme.
    - Verify that the color contrast is sufficient for accessibility.