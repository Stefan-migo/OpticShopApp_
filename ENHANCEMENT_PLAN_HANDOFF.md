# Optic Shop Management SaaS - Enhancement Plan & Handoff

**Document Version:** 2025-05-04 (Updated 2025-05-04 11:09 PM)

## 1. Purpose of this Document

This document outlines planned enhancements for the Optic Shop Management SaaS project, based on recent research and user feedback. It serves as a guide for the next phase of development and can be used for handoff to other developers or AI agents.

**Instructions for Next Agent/Developer:**
*   Review the "Current Status Summary" to understand the baseline.
*   Prioritize work based on the "Detailed Enhancement Plan" and "Next Steps" sections.
*   Update this document as enhancements are implemented.
*   Adhere to the established Tech Stack & Conventions.
*   Commit frequently.

## 2. Project Objective (Recap)

Develop a modern, web-based SaaS application using Next.js, TypeScript, TailwindCSS, Shadcn/ui, and Supabase to streamline the core operations of an optical retail business.

## 3. Current Status Summary (As of 2025-05-02)

*   **Phase 1 (MVP):** **[COMPLETED]** Includes Setup, User Auth, Customer Management (CRUD), Product Catalog (CRUD), Basic Inventory Stock (CRUD), Basic Prescription Management (CRUD + View), Basic POS (Manual Record).
*   **Phase 2 (Initial Modules & Refinements):**
    *   **Appointment Scheduling:** **[COMPLETED]** Basic CRUD, interactive calendar UI.
    *   **Basic Reporting:** **[COMPLETED]** Reports page with summary cards (Sales, Customers, Inventory).
    *   **RLS:** **[COMPLETED (Refined)]** RLS enabled, helper function created, Admin/Staff SELECT/INSERT/UPDATE, Admin only DELETE policies applied. New user trigger assigns 'staff'.
    *   **User Management (Admin UI):** **[COMPLETED (Basic)]** Admin page created, lists users (profiles only), allows role changes.
    *   **POS Inventory Update:** **[COMPLETED (RPC)]** `decrement_inventory` DB function implemented and used in POS.
    *   **View Past Sales:** **[COMPLETED (List + Details)]** History page and details dialog implemented.
    *   **Profile/Settings Pages:** **[COMPLETED (Basic)]** Profile page created (view email/role, edit name), placeholder Settings page created, links added to UserNav.
    *   **Dashboard:** **[COMPLETED (Basic Summaries)]** Displays summary cards similar to Reports page.
    *   **Settings Page Enhancements:** **[COMPLETED]** Fixed issue with working hours inputs disappearing and added a toggle to show/hide working hours.

*(Refer to `PROJECT_PLAN.md` for more granular status details)*

## 4. Detailed Enhancement Plan

### 4.1. Dashboard

*   **Goal:** Provide a more personalized and actionable overview.
*   **Plan:**
    1.  **Greeting:** Add a personalized greeting (e.g., "Good morning, [User Name]!"). Requires fetching user's name (likely from `profiles`).
    2.  **Upcoming Appointments Card:** Implement logic to fetch and display upcoming appointments (e.g., today/next few days) including patient name, time, type. Add a link to the main `/appointments` page.
    3.  **(Future)** Add quick action buttons (e.g., "New Sale", "Schedule Appointment").
    4.  **(Future)** Add simple charts for key trends (e.g., Sales this week vs. last week).

### 4.2. Customers (CRM)

*   **Goal:** Create a more comprehensive 360-degree view of the customer.
*   **Plan:**
    1.  **Enhance Data Model:** **[COMPLETED]** Add fields to `customers` table: `dob` (DATE), `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country` (all TEXT), `insurance_provider` (TEXT, nullable), `insurance_policy_number` (TEXT, nullable).
    2.  **Customer Detail View:** **[COMPLETED - Basic]** Create/Enhance a view (page or dialog) accessible from the customer list to display:
        *   **[COMPLETED]** All profile info (including new fields).
        *   **[COMPLETED]** Linked Data Sections (Tabs/Cards): Past Sales, Appointments, Prescriptions.
    3.  **Implement Notes:** **[COMPLETED - Basic]** Create `customer_notes` table (columns: `id`, `customer_id`, `user_id`, `note` (TEXT), `created_at`). Add UI to Customer Detail View to add/display notes chronologically.

    DONE!

### 4.3. Inventory / Stock

*   **Goal:** Improve stock tracking and enable proactive management.
*   **Plan:**
    1.  **Structure:** Maintain separation of `products` (catalog) and `inventory_items` (stock).
    2.  **Suppliers:** Ensure Supplier CRUD is easily accessible (consider dedicated tab/page).
    3.  **Low Stock Threshold:**
        *   Add `reorder_level` (INT, nullable) column to `products` table.
        *   Add field to `ProductForm` to set/edit `reorder_level`.
    4.  **Low Stock Report:** Create a view/report listing products at or below their `reorder_level`.
    5.  **(Future)** Implement Purchase Order system (`purchase_orders`, `purchase_order_items` tables).
    6.  **(Future)** Implement automated low stock notifications.

### 4.4. Prescriptions & Medical Records

*   **Goal:** Introduce basic EHR capabilities and role-specific access for clinical data.
*   **Plan:**
    1.  **New Role:** Add `optometrist` role to `roles` table. Update User Management UI.
    2.  **Medical Records Table:** Create `medical_records` table (`id`, `customer_id`, `record_date`, `optometrist_id`, `chief_complaint`, `medical_history`, `examination_findings`, `diagnosis`, `treatment_plan`, `notes`, `created_at`, `updated_at`).
    3.  **Link Tables:** Add `medical_record_id` (UUID, FK, nullable) to `prescriptions` table.
    4.  **UI:** Create UI (likely section in Customer Detail View or dedicated page) for `optometrist` role to manage medical records. Update `PrescriptionForm` to allow linking/creating associated medical record.
    5.  **Refine RLS:** Implement strict RLS for `medical_records` (Optometrist/Admin access only). Refine `prescriptions` RLS based on roles and potential patient assignment.

### 4.5. Appointment Scheduling

*   **Goal:** Improve scheduling efficiency and tracking.
*   **Plan:**
    1.  **Settings:** Add settings for working hours (per day) and default slot duration (e.g., 20 mins).
    2.  **Slot Generation/Booking:** **[COMPLETED]** Implemented calendar/form UI to use clinic settings for slot duration and working hours.
    3.  **Status Enhancement:** Expand `appointment_status` enum (e.g., add 'confirmed', 'checked_in', 'no_show'). Add UI elements for staff/admin to update status.
    4.  **(Future)** Implement automated appointment reminders.
    5.  **(Future)** Link appointments to specific providers (`provider_id` FK to `profiles`) and factor their availability into slot generation.

### 4.6. Sales / POS

*   **Goal:** Implement configurable, automated tax calculation.
*   **Plan:**
    1.  **Tax Rate Settings:** **[COMPLETED]** Create `tax_rates` table (`id`, `name`, `rate`, `is_default`). Add UI in Settings for admin CRUD.
    2.  **POS Update:** **[COMPLETED]** Fetch default tax rate. Replace manual tax input with automatic calculation based on subtotal and rate. Display applied rate. Store `tax_rate_id` and `tax_amount` in `sales_orders`.
    3.  **(Future)** Implement per-product/category tax rates and line-item tax calculation.**[Future]**

### 4.7. Reporting

*   **Goal:** Provide more insightful business intelligence.
*   **Plan:**
    1.  **Date Range Filtering:** Add date range selectors to the `/reports` page.
    2.  **Filter Summaries:** Update summary cards to reflect selected date range.
    3.  **New Sales Reports:** Detailed sales list (DataTable), Sales by Product/Category.
    4.  **New Inventory Reports:** Low Stock Report.
    5.  **New Appointment Reports:** Appointments by Status.
    6.  **Visualization:** Add basic charts (e.g., Sales over Time).
    7.  **(Future - Requires Data):** Inventory Turnover, Stock Aging, Capture Rate, Recall reports.

## 5. UI Theming Plan

*   **Goal:** Allow users to select different visual themes (light, dark, custom).
*   **Plan:**
    1.  **Configure:** Ensure `tailwind.cssVariables` is true in `components.json`.
    2.  **Define Themes:** Define CSS variables for default light/dark themes and 2-3 custom themes (e.g., Ocean, Forest) in `globals.css` using `:root`, `.dark`, and `html[data-theme='...']` selectors.
    3.  **Integrate `next-themes`:** Install library, wrap root layout in `ThemeProvider`.
    4.  **Build Switcher:** Create theme selection component in `/settings` using `useTheme` hook.
    5.  **(Optional)** Persist user theme preference in `profiles` table.

## 6. Next Steps (Suggested Prioritization)

1.  **Implement Core Enhancements:**
    *   Customer Detail View (showing linked data). **[COMPLETED]**
    *   Appointment Slot Generation/Booking UI (Configure Slot Size). **[COMPLETED]**
    *   Configurable Tax Rate implementation (Settings UI + POS calculation). **[COMPLETED]**
    *   Low Stock Report. **[COMPLETED]**
2.  **Implement Medical Records:** (Requires careful planning due to sensitivity)
    *   Add `optometrist` role.
    *   Create `medical_records` table & link to prescriptions.
    *   Build basic UI for optometrists.
    *   Implement strict RLS.
3.  **Implement Theming:**
    *   Setup `next-themes` and define base themes.
    *   Build switcher in Settings.
4.  **Further Reporting:** Add more detailed reports and charts.
5.  **Address Remaining TODOs:** User emails in admin, purchase orders, advanced tax rules, etc.

This provides a comprehensive roadmap for enhancing the application based on our discussion.

## 7. Version Control

This project's source code is hosted on GitHub at:
[https://github.com/Stefan-migo/OpticShopApp_](https://github.com/Stefan-migo/OpticShopApp_)

The primary development branch is `main`.
