# Activity Point Tracker

BMSCE AICTE Activity Points Tracker mobile application project writeup.

---

## **1. Project Title**
**Activity Point Tracker** (BMSCE AICTE Activity Points Tracker)

---

## **2. Objectives**
*   **Graduation Compliance**: To facilitate engineering students in tracking and reaching the mandatory **100 AICTE Activity Points** required for the award of their B.E. degree.
*   **Categorised Point Tallies**: To automate points compilation across 8 distinct AICTE categories (Events, Professional Bodies, Exams, Seminars, Clubs, Volunteering, Academics, and Cultural).
*   **Verification Simulation**: To integrate a certificate scanner with a 30-second verification queue, simulating a proctoring approval process.
*   **Offline-First & Local Persistence**: To store student details, sessions, and activity logs securely on the client-side device using `AsyncStorage`, avoiding the need for database hosting.
*   **Modern Visual Interface**: To present a highly interactive, responsive light-mode Indigo/Slate theme that compiles on mobile devices via Expo Go.

---

## **3. Software and Hardware Requirements**

### **A. Software Requirements**
*   **Operating System**: macOS / Windows / Linux (for development); iOS / Android (for client runtimes).
*   **Runtime Environment**: Node.js (v20.x or above), NPM (v10.x).
*   **Frameworks & Libraries**: Expo SDK 54, React Native (v0.81.5), React (v19.1.0).
*   **Local Storage API**: `@react-native-async-storage/async-storage` (v2.2.0).
*   **Asset Pickers**: `expo-image-picker`, `expo-camera`.
*   **Development Tools**: Expo CLI, VS Code, Git.

### **B. Hardware Requirements**
*   **Development PC**: Minimum 8GB RAM, Core i5/Apple Silicon processor.
*   **Target Device**: iPhone / Android phone with camera capability running the **Expo Go** application.

---

## **4. ER Diagram**
The system utilizes an offline-first relational schema mapped locally. Below is the structural layout of entities, attributes, and relationships:

### **A. Entities & Attributes**
1.  **Student (User)**:
    *   `USN` (Primary Key - e.g., `1BM22CS001`)
    *   `Name` (e.g., `Sahil`)
    *   `Degree` (e.g., `B.E. Computer Science`)
    *   `Password` (Encrypted credential key)
2.  **Activity (Ledger Entry)**:
    *   `ActivityID` (Primary Key - Unique timestamp-based string)
    *   `Title` (e.g., `NSS Blood Donation Camp`)
    *   `Category` (Foreign Key mapping to predefined category ID)
    *   `Detail` (Specific criteria / role metadata)
    *   `Date` (Submission/event date string)
    *   `Points` (Integer credit value)
    *   `Status` (String: `Approved` / `Pending` / `Verifying`)
    *   `verificationTimeLeft` (Integer - remaining seconds countdown)

### **B. Relationships**
*   **Student** has **Activities**: **One-to-Many (1:N)** relationship. A single student profile can register multiple activities in their ledger log, while each activity belongs strictly to one student.

---

## **5. Conclusion and Future Scope**

### **A. Conclusion**
The *Activity Point Tracker* successfully transitions paper-heavy graduation point tracking into a streamlined mobile solution. Built on React Native and Expo Go, the app provides instant point visualisations, category charts, and certificate upload capabilities. The local-first data model ensures high performance, zero server-maintenance costs, and total user privacy.

### **B. Future Scope**
*   **Production OCR Integration**: Connecting the scanner camera to a cloud vision OCR API (e.g., Google Cloud Vision or AWS Textract) to read physical certificate texts and extract fields automatically in real-time.
*   **Proctor Synchronization**: Implementing a backend (Node.js/Express + PostgreSQL/MongoDB) to sync logs to a centralized database, letting college proctors inspect and approve student entries from their own portal.
*   **Geotag & Timestamp Auditing**: Reading metadata from uploaded photo files to verify that geo-tagged event photos match the date and location of the registered activity.
