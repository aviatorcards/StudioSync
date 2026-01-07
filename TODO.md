- [x] **Redesign Popup Dialog** `[frontend]`
  - [x] Analyze Existing Modal Component `[frontend]`
    - [x] Read and analyze the `Modal.tsx` file `[frontend]`
    - [x] Identify how it's being used in other components `[frontend]`
  - [x] Propose a New Design `[frontend]`
    - [x] Create a design that is modern, clean, and functional `[frontend]`
    - [x] Ensure the design is responsive for desktop and mobile `[frontend]`
    - [x] Ensure the design is accessible `[frontend]`
  - [x] Implement the New Design `[frontend]`
    - [x] Update the JSX in `Modal.tsx` to reflect the new structure (header, body, footer) `[frontend]`
    - [x] Use Tailwind CSS to style the component `[frontend]`
    - [x] Use `framer-motion` for animations `[frontend]`
    - [x] Implement accessibility features `[frontend]`
  - [x] Update Components Using the Modal `[frontend]`
    - [x] Search the codebase for instances where `Modal.tsx` is used `[frontend]`
    - [x] Update the props passed to the `Modal` component `[frontend]`
    - [x] Ensure that the content passed to the modal is correctly structured `[frontend]`
  - [x] Test the New Design `[test]`
    - [x] Manually test the modal on desktop and mobile browsers `[test]`
    - [x] Test the modal's responsiveness `[test]`
    - [x] Test the accessibility features `[test]`
    - [x] Verify that all components using the modal are still working correctly `[test]`
- [ ] **Redesign Landing Page Color Scheme** `[frontend]`
  - [ ] Analyze Existing Color Scheme `[frontend]`
    - [ ] Analyze `frontend/tailwind.config.js` to see the defined color palette `[frontend]`
    - [ ] Search for the color class names in the `frontend/app` directory `[frontend]`
  - [ ] Propose a New Color Palette `[frontend]`
    - [ ] Create a new color palette based on earth tones `[frontend]`
    - [ ] Present the proposed color palette to the user for approval `[frontend]`
  - [ ] Implement the New Color Palette `[frontend]`
    - [ ] Update the `frontend/tailwind.config.js` file with the new colors `[frontend]`
    - [ ] Replace the old color class names with the new ones in the relevant files `[frontend]`
  - [ ] Test the New Color Scheme `[test]`
    - [ ] Review the landing pages and any other affected pages to check the new color scheme `[test]`
    - [ ] Verify that the color contrast is sufficient for accessibility `[test]`

---

## Setup Wizard Implementation `[feature]`

> WordPress-style first-time setup wizard to eliminate manual Docker commands
> **Status:** Backend models created, API and frontend pending
> **See:** `.gemini/antigravity/brain/.../setup_wizard_plan.md` for full spec

### Phase 1: Backend Foundation `[backend]`

- [x] Create `SetupStatus` model in `apps/core/models.py` `[backend]`
- [x] Create `FeatureFlag` model in `apps/core/models.py` `[backend]`
- [x] Create migration `0010_setup_wizard.py` `[backend]`
- [ ] Apply migration: `docker compose run backend python manage.py migrate` `[backend]`
- [ ] Create setup serializers in `apps/core/serializers.py` `[backend]`
  - [ ] `SetupWizardSerializer` - handles complete setup data
  - [ ] `FeatureFlagSerializer` - handles feature toggles
- [ ] Create `SetupWizardView` API endpoint in `apps/core/views.py` `[backend]`
  - [ ] GET `/api/setup/status/` - check if setup needed
  - [ ] POST `/api/setup/complete/` - complete setup wizard
  - [ ] Validate all input data
  - [ ] Create studio, admin user, feature flags
  - [ ] Return auth token for auto-login
- [ ] Add setup routes to `apps/core/urls.py` `[backend]`
- [ ] Create management commands `[backend]`
  - [ ] `check_setup.py` - display setup status on startup
  - [ ] `create_sample_data.py` - generate sample data for testing

### Phase 2: Frontend Wizard UI `[frontend]`

- [ ] Create setup wizard pages `[frontend]`
  - [ ] `/app/setup/page.tsx` - main wizard container
  - [ ] `/app/setup/layout.tsx` - setup-specific layout
- [ ] Create wizard step components `[frontend]`
  - [ ] `WelcomeStep.tsx` - welcome screen with language selection
  - [ ] `StudioInfoStep.tsx` - studio name, address, timezone, currency
  - [ ] `AdminAccountStep.tsx` - admin email, name, password
  - [ ] `FeatureSelectionStep.tsx` - toggle features on/off
  - [ ] `QuickSettingsStep.tsx` - lesson duration, business hours
  - [ ] `SampleDataStep.tsx` - option to create sample data
  - [ ] `CompletionStep.tsx` - success screen with confetti
- [ ] Create shared components `[frontend]`
  - [ ] `ProgressBar.tsx` - show wizard progress
  - [ ] `FeatureCard.tsx` - feature toggle card with icon
- [ ] Add form validation and error handling `[frontend]`
- [ ] Add loading states and animations `[frontend]`

### Phase 3: Feature Flag System `[frontend]`

- [ ] Create `useFeatureFlags` hook in `hooks/useFeatureFlags.ts` `[frontend]`
- [ ] Create feature types in `types/setup.ts` `[frontend]`
- [ ] Update sidebar navigation to filter by enabled features `[frontend]`
- [ ] Create feature settings page at `/dashboard/settings/features` `[frontend]`
- [ ] Add feature flag context provider `[frontend]`

### Phase 4: Integration & Testing `[test]`

- [ ] Connect wizard frontend to backend API `[integration]`
- [ ] Test complete setup flow on fresh install `[test]`
- [ ] Test feature toggle functionality `[test]`
- [ ] Test sample data generation `[test]`
- [ ] Add automated tests `[test]`
  - [ ] Backend: `apps/core/tests/test_setup.py`
  - [ ] Frontend: wizard component tests
- [ ] Test on fresh Docker install (all platforms) `[test]`

### Phase 5: Polish & Documentation `[docs]`

- [ ] Add tooltips and help text to all form fields `[frontend]`
- [ ] Add success animations (confetti on completion) `[frontend]`
- [ ] Update README with setup wizard instructions `[docs]`
- [ ] Create video walkthrough of setup process `[docs]`
- [ ] Update deployment documentation `[docs]`

### Quick Fix (Temporary) `[backend]`

> Until wizard is complete, use this to create admin user:

```bash
docker compose run backend python manage.py createsuperuser
```

### Implementation Options

- **Option A:** Full 7-step wizard (~10-12 hours)
- **Option B:** MVP single-page setup (~2-3 hours) ← Recommended
- **Option C:** Enhanced registration page (~4-6 hours)

### Files Created So Far

- ✅ `backend/apps/core/models.py` - Added SetupStatus & FeatureFlag models
- ✅ `backend/apps/core/migrations/0010_setup_wizard.py` - Migration file
- ✅ `.gemini/.../setup_wizard_plan.md` - Full implementation plan
- ✅ `.gemini/.../create_admin_quick_fix.md` - Quick admin creation guide

### Next Steps

1. Apply migration on dev machine
2. Build API endpoints for setup
3. Create frontend wizard (MVP or full version)
4. Test complete flow
5. Deploy and document
