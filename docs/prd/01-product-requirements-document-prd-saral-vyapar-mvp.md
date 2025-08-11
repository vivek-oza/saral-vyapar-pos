### **Product Requirements Document (PRD): Saral Vyapar MVP**

**Version:** 1.0
**Date:** August 10, 2025
**Status:** Draft for Review

***

#### **1. Introduction & Vision**

"Saral Vyapar" is a web-based Point-of-Sale (POS) system designed specifically for small to medium-sized retailers. The core vision is to provide an intuitive, feature-rich platform that is easy to adopt and use, works seamlessly on both desktop and mobile devices, and provides actionable business insights through a powerful analytics dashboard. The project prioritizes a "seamless, least amount of clicks" user experience.

#### **2. User Persona**

* **Primary User:** A small or medium-sized business owner/manager in India. They are tech-savvy enough to use a smartphone and a web browser but may not have experience with complex enterprise software. They are busy and need tools that save time and simplify their daily operations.

#### **3. Problems to be Solved**

* Existing POS systems are often too complex, expensive, or lack essential features.
* Retailers lack an easy way to track inventory automatically.
* Business owners struggle to get clear, actionable insights from their sales data (e.g., top-selling products, peak business hours).
* The need for separate desktop and mobile solutions creates friction.

#### **4. Feature Requirements (MVP Scope)**

The following features constitute the Minimum Viable Product.

| Module | Feature | User Story / Requirement |
| :-- | :-- | :-- |
| **Onboarding** | Account & Shop Creation | A new user must be able to sign up with an email/password and set up their shop essentials (Name, Address, GST) in a single, guided flow. |
| **Product Mgmt.** | Product Catalog | User can manually add products with a name, base price, and profit margin. |
|  | Flexible Variations | User can add variations (e.g., Size, Color) to a product, each with its own stock count. |
|  | Bulk Import | User can import their entire product catalog using an Excel/CSV file to save time. |
| **Inventory Mgmt.** | Auto-Deduction | Inventory levels must be automatically reduced for each item sold when a bill is generated. |
|  | Stock Alerts & Updates | The system will display "Low Stock" / "Out of Stock" statuses. The user can manually update stock levels. |
| **Billing Engine** | Core Billing UI | A two-column interface allowing the user to build a bill on one side while finding products on the other. |
|  | Search & Quick Add | The primary way to add products is via a fast search bar. The UI will also feature tabs for "Quick Access" and "Top Sellers". |
|  | Bill Generation | The user can finalize a bill, log the payment method (Cash, Card, UPI), and generate an HTML preview with options to Print or Download as a PDF. |
| **Analytics** | KPI Dashboard | Upon login, the user will see a dashboard with key metrics: Today's Sales, Top Selling Products, Peak Sales Hours, and Number of Bills. |
|  | Sales & Stock Reports | The user can view reports on sales trends over time, fast-moving vs. slow-moving stock, and stock aging. |

#### **5. Non-Goals (Out of Scope for MVP)**

To ensure a focused and timely launch, the following features are explicitly excluded from the MVP:

* Advanced user roles and permissions (e.g., Admin vs. Cashier).
* Hardware integration (e.g., barcode scanners, receipt printers).
* Complex discount and coupon module.
* A formal system for handling returns and issuing credit notes.
* Automated Purchase Order (PO) management.
* Live payment gateway integration.

#### **6. Technical Specifications**

* **Platform:** Fully Responsive Web Application.
* **Frontend:** React.
* **Backend:** Node.js / Express.js.
* **Database:** MongoDB.
* **UI Library:** Shadcn UI.

#### **7. Success Metrics**

The success of the Saral Vyapar MVP will be measured by:

* **User Adoption:** Number of new shops created per week.
* **Engagement:** Number of bills generated per active shop per day.
* **Usability:** Time from signup to first bill generated.
* **Retention:** Percentage of users who are still active 30 days after signup.

***

This document now serves as the single source of truth for the project's development. Please review it for accuracy. With your approval, this PRD will be locked, and the team will proceed with the development plan outlined by the Project Manager.
