#saral-vyapar-pos-architecture

### **System Architecture Document: Saral Vyapar**

**Version:** 1.0
**Date:** August 10, 2025
**Author:** System Architect

***

#### **1. Overview**

This document outlines the comprehensive technical architecture for the "Saral Vyapar" POS system. The architecture is designed to support the features defined in the MVP, adhering to modern web development best practices. It is based on the selected MERN stack (MongoDB, Express.js, React, Node.js).

The chosen architecture is a **Client-Server model** utilizing a **Single Page Application (SPA)** on the frontend and a **RESTful API** on the backend. This decouples the user interface from the business logic, allowing for independent development, deployment, and scaling.

#### **2. Architectural Goals \& Principles**

* **Scalability:** The system must be able to handle a growing number of users, products, and transactions without a degradation in performance.
* **Maintainability:** Code should be modular, well-organized, and easy to understand to facilitate future updates and feature additions.
* **Security:** All data, especially user credentials and business information, must be secured both in transit and at rest.
* **Responsiveness:** The user interface must provide a seamless experience across a wide range of devices, from desktops to mobile phones.
* **Performance:** The application, particularly the billing module and analytics queries, must be fast and responsive.


#### **3. High-Level Architecture Diagram**

```
+----------------+      |  +-----------------+      |  +-----------------+
|                |      |  |                 |      |  |                 |
|   User Device  | HTTPS|  |  Backend API    |      |  |   Database      |
| (React SPA)    |<---->|  | (Node.js/Express)|<---->|  | (MongoDB)       |
|                |      |  |                 |      |  |                 |
+----------------+      |  +-----------------+      |  +-----------------+
       /|\              |         /|\              |          /|\
        |               |          |               |           |
+----------------+      |  +-----------------+      |  +-----------------+
| Client-Side    |      |  | - API Endpoints |      |  | - User Data     |
| - UI Components|      |  | - Business Logic|      |  | - Shop Data     |
| - State Mgmt   |      |  | - Auth (JWT)    |      |  | - Product Data  |
| - API Calls    |      |  | - Data Validation|      |  | - Bill Data     |
+----------------+      |  +-----------------+      |  +-----------------+
```


***

#### **4. Component Deep Dive**

##### **4.1 Frontend (Client)**

The frontend is a Single Page Application built with React. It is responsible for rendering the UI and communicating with the backend API.

* **Framework:** **React 18+** will be used for building the user interface components.
* **UI Library:** **Shadcn UI** will provide the base components, ensuring a consistent, modern, and accessible design system.
* **State Management:**
    * For local component state, **React Hooks** (`useState`, `useEffect`) will be used.
    * For global state (e.g., logged-in user information), **React Context API** will be used for the MVP. This is lightweight and sufficient for the initial scope. If state complexity grows, migration to a library like **Zustand** or **Redux Toolkit** will be considered.
* **Routing:** **React Router** will manage all client-side navigation between pages like Dashboard, Billing, and Products.
* **API Communication:** The **Axios** library will be used to make structured and secure HTTP requests to the backend REST API. An Axios instance will be configured to automatically include the user's JWT in the authorization header for all protected requests.


##### **4.2 Backend (Server)**

The backend is a Node.js application using the Express.js framework to provide a RESTful API.

* **Core Technology:** **Node.js** with **Express.js**.
* **API Design:** A **RESTful API** will expose resources (Users, Products, Bills) via standard HTTP methods (GET, POST, PUT, DELETE).
* **Authentication \& Authorization:**
    * **JWT (JSON Web Tokens)** will be used for stateless authentication.
    * **Workflow:**

1. User signs in with email/password.
2. Server validates credentials and, if successful, generates a signed JWT containing the `userId` and `shopId`.
3. Server sends the JWT back to the client.
4. Client stores the JWT securely (in `httpOnly` cookie or local storage) and includes it in the `Authorization: Bearer <token>` header of all subsequent requests to protected routes.
5. A custom middleware on the server will verify the JWT on every incoming request to a protected route.
* **Password Security:** Passwords will be hashed using the **bcrypt** library before being stored in the database.
* **Core API Endpoints (Illustrative):**

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| `POST` | `/api/auth/signup` | Creates a new user and their shop. |
| `POST` | `/api/auth/login` | Authenticates a user and returns a JWT. |
| `POST` | `/api/products` | Adds a new product to the shop's catalog. |
| `POST` | `/api/products/import` | Bulk-imports products from a CSV file. |
| `GET` | `/api/products` | Retrieves a list of all products for the shop. |
| `POST` | `/api/bills` | Creates a new bill and updates inventory. |
| `GET` | `/api/analytics/kpis` | Retrieves the main dashboard KPIs. |
| `GET` | `/api/analytics/sales-trends` | Retrieves data for sales trend charts. |

##### **4.3 Database (Persistence)**

* **Database System:** **MongoDB**, a NoSQL document database, chosen for its flexibility in handling varied data structures like product variations.
* **Data Models (Mongoose Schemas):**
    * **`User` Schema:**
        * `email`: { type: String, required: true, unique: true }
        * `password`: { type: String, required: true }
    * **`Shop` Schema:**
        * `owner`: { type: ObjectId, ref: 'User' }
        * `name`: { type: String, required: true }
        * `address`: { type: String }
        * `gstNumber`: { type: String }
    * **`Product` Schema:**
        * `shop`: { type: ObjectId, ref: 'Shop' }
        * `name`: { type: String, required: true }
        * `basePrice`: { type: Number, required: true }
        * `marginInCurrency`: { type: Number }
        * `stock`: { type: Number, default: 0 }
        * `variations`: [ { `name`: String, `value`: String, `stock`: Number } ]
    * **`Bill` Schema:**
        * `shop`: { type: ObjectId, ref: 'Shop' }
        * `billNumber`: { type: String, unique: true }
        * `timestamp`: { type: Date, default: Date.now }
        * `customer`: { `name`: String, `phone`: String }
        * `lineItems`: [ { `productId`: ObjectId, `name`: String, `quantity`: Number, `price`: Number } ]
        * `totalAmount`: { type: Number, required: true }
        * `paymentMode`: { type: String, enum: ['Cash', 'Card', 'UPI'] }

***

#### **5. Deployment \& Infrastructure**

* **Hosting Strategy:**
    * **Frontend (React App):** Deployed on **Vercel**. Vercel offers seamless integration with Git, automatic CI/CD, global CDN for performance, and free SSL.
    * **Backend (Node.js API):** Deployed on a PaaS (Platform as a Service) like **Railway** or **Heroku**. These platforms simplify deployment and scaling.
    * **Database (MongoDB):** **MongoDB Atlas**, a fully managed cloud database service. This handles backups, scaling, and security.
* **CI/CD Pipeline:** A simple CI/CD pipeline will be set up using **GitHub Actions**. On every push to the `main` branch, automated tests will run, and if they pass, the code will be automatically deployed to the respective hosting provider (Vercel/Railway).

***

#### **6. Security, Scalability \& Performance**

* **Security:**
    * **Data in Transit:** Enforced HTTPS on all communications.
    * **Secrets Management:** API keys, database connection strings, and JWT secrets will be stored as environment variables, never in the codebase.
    * **Input Validation:** Backend will use a library like **Joi** or **express-validator** to validate and sanitize all incoming data to prevent XSS and NoSQL injection attacks.
    * **CORS:** The backend will be configured with a strict CORS policy to only allow requests from the frontend domain.
* **Scalability \& Performance:**
    * **Database:** Proper indexing will be applied to MongoDB collections, especially on fields used for frequent queries (e.g., `shopId`, `timestamp`), to ensure fast analytics.
    * **Backend:** The stateless nature of the JWT-based API allows for horizontal scaling by simply adding more server instances behind a load balancer if needed in the future.
    * **Frontend:** Code splitting will be used in React (natively supported) to only load the JavaScript necessary for the current view, improving initial page load times.

