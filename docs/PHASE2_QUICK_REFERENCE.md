# Phase 2 Quick Reference Card
## 5-Minute Testing Checklist

---

## ✅ Code Status: COMPLETE
## ⚠️ Testing Status: MANUAL REQUIRED
## 🌐 Web App: Running on http://localhost:8081

---

## Quick Visual Test (5 Minutes)

### 1. Navigate to Form
```
Open: http://localhost:8081
Click: "Create Company" or similar
Reach: Step 1 (Basic Information)
```

### 2. Visual Checks (Empty Upload)

Look at the logo upload area and verify:

| Check | Expected | Pass/Fail |
|-------|----------|-----------|
| **Shape** | Square (1:1), not rectangle (4:3) | [ ] |
| **Size** | Small (~150px), not full-width | [ ] |
| **Position** | Centered, not left-aligned | [ ] |
| **Border** | Dashed border visible | [ ] |
| **Icon** | Camera icon and "Upload Logo" text | [ ] |

**Visual**: Logo should be a small square centered on the page, much smaller than the form fields below it.

### 3. Upload Test

Upload a test image (any JPG or PNG):

| Check | Expected | Pass/Fail |
|-------|----------|-----------|
| **Upload** | File picker opens, image uploads | [ ] |
| **Display** | Image shows in square container | [ ] |
| **Size** | Container ~150x150px, centered | [ ] |
| **Remove** | X button visible, clickable | [ ] |
| **Edit** | Camera button visible, clickable | [ ] |
| **Quality** | Image looks clear, not pixelated | [ ] |

### 4. Responsive Quick Check

Open browser DevTools (F12), resize window:

| Width | Expected | Pass/Fail |
|-------|----------|-----------|
| **Wide (1920px)** | Logo stays 150px, lots of space | [ ] |
| **Medium (768px)** | Logo stays 150px, centered | [ ] |
| **Narrow (375px)** | Logo scales/fits, still centered | [ ] |

---

## Expected Appearance

### Before Phase 2 (Old):
```
┌──────────────────────────────────────┐
│                                      │
│  ┌────────────────────────────────┐  │
│  │      LARGE RECTANGULAR         │  │  <- Full width
│  │      LOGO AREA (4:3)           │  │     Dominates page
│  │                                │  │
│  └────────────────────────────────┘  │
│                                      │
│  Company Name: _________________    │
└──────────────────────────────────────┘
```

### After Phase 2 (New):
```
┌──────────────────────────────────────┐
│                                      │
│           ┌─────────┐                │  <- Small, centered
│           │ SQUARE  │                │     150x150px
│           │  LOGO   │                │     Doesn't dominate
│           └─────────┘                │
│                                      │
│  Company Name: _________________    │
└──────────────────────────────────────┘
```

**Key Difference**: Logo went from dominating the page to being a small, centered, supporting element.

---

## Pass/Fail Decision

### ✅ ALL PASS = Phase 2 Complete
If all checks above pass:
- Phase 2 implementation successful
- Ready to mark as complete
- Can proceed to Phase 3

### ❌ ANY FAIL = Needs Investigation
If any check fails:
1. Note which specific check failed
2. Capture screenshot of the issue
3. Report issue with details
4. Review code for that specific area

---

## Common Issues & Quick Fixes

### Issue: Logo Not Centered
**What you see**: Logo is left-aligned, flush with form fields
**Check in code**: Step1BasicInfo.tsx line 65 should have `centerAlign={true}`
**Quick test**: In DevTools, check if logo container has `alignItems: 'center'`

### Issue: Logo Still Large
**What you see**: Logo takes up most of the width
**Check in code**: Step1BasicInfo.tsx lines 63-64 should have `maxWidth={150}` and `maxHeight={150}`
**Quick test**: In DevTools, measure width and height (should be ~150px each)

### Issue: Logo Not Square
**What you see**: Logo is rectangular (wider or taller)
**Check in code**: Step1BasicInfo.tsx line 62 should have `aspectRatio={[1, 1]}`
**Quick test**: In DevTools, verify width equals height

### Issue: Buttons Not Showing
**What you see**: Can't see X or camera buttons after upload
**Check**: Upload a different image (try light and dark backgrounds)
**Note**: Buttons have semi-transparent background, should be visible on most images

---

## Screenshots Needed

If testing looks good, capture these 3 essential screenshots:

1. **Empty state**: Logo upload button (square, centered, dashed border)
2. **With image**: Uploaded logo showing edit/remove buttons
3. **Full page**: Entire Step 1 form showing visual hierarchy

Save to: `/mnt/c/Users/Teo/Desktop/SMA-NEW/docs/screenshots/phase2/`

**Naming**:
- `step1-logo-empty.png`
- `step1-logo-with-image.png`
- `step1-visual-hierarchy.png`

---

## Complete Documentation

For detailed testing instructions, see:

| Document | Purpose | Time |
|----------|---------|------|
| **PHASE2_QUICK_REFERENCE.md** (this file) | Quick 5-min test | 5 min |
| **PHASE2_MANUAL_TESTING_GUIDE.md** | Comprehensive testing | 20 min |
| **PHASE2_TEST_REPORT.md** | Full code review & analysis | Reference |
| **PHASE2_TEST_SUMMARY.md** | Overview & next steps | Reference |

---

## One-Line Summary

**Phase 2 code is complete (79% size reduction, square, centered) - needs 5-minute visual test to confirm.**

---

**Quick Reference Version**: 1.0
**Purpose**: Fast manual testing without reading detailed docs
**Time Required**: 5 minutes
**Difficulty**: Very Easy
