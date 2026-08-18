<h1 align="center">🇲🇾 MyGateway — Grounded AI Digital Cockpit & Multi-Agency Government Service Orchestrator</h1>

<p align="center">
  <strong>An intelligent citizen portal capable of grounding AI recommendations in Malaysian public service datasets, orchestrating multi-agency application journeys, and providing hands-free voice assistance with dynamic form autofill.</strong>
</p>

<p align="center">
  <em><b>MyGateway</b> — Simplifying enterprise licensing and citizen life events through proactive public service journeys.</em><br/>
</p>

<p align="center">
  <b>🚀 Live Demo</b> •
  <b>🎥 Watch our Pitching Video</b>
</p>

<div align="center">
  <h3>🔑 Test Credentials (Demo Accounts)</h3>
  <p>To explore the platform, sign in using these simulated credentials in the login screen:</p>
  <table style="margin: 0 auto; text-align: left; border-collapse: collapse;">
    <thead>
      <tr style="border-bottom: 2px solid #ddd;">
        <th style="padding: 10px 15px;">Role / Profile</th>
        <th style="padding: 10px 15px;">Auth Method</th>
        <th style="padding: 10px 15px;">User Info</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 15px;">🍔 <b>F&B Entrepreneur</b></td>
        <td style="padding: 10px 15px;">Scan QR Code (MyDigital ID) / Direct Log In</td>
        <td style="padding: 10px 15px;"><code>Siti</code> / <code>Jason</code> (B40, F&B Business Profile)</td>
      </tr>
      <tr>
        <td style="padding: 10px 15px;">🎓 <b>Higher Ed Student</b></td>
        <td style="padding: 10px 15px;">Direct Log In</td>
        <td style="padding: 10px 15px;">Simulated Citizen Profile (For PTPTN & Housing)</td>
      </tr>
    </tbody>
  </table>
</div>

---

## 👥 Team Details & Responsibilities

* **Team Name**: Trail Never Ends

| Member | Role | Responsibility |
| :--- | :--- | :--- |
| **Chun Yao Ting** | Leader | **Backend API & Middleware Integration**: Integrating custom Vite/Express API middleware plugins, configuring real-time WebSockets, and managing Google Cloud Speech & TTS services. |
| **Angela Ngu Xin Yi** | Member | **Frontend & UX Design**: Developing the responsive React UI dashboard, the interactive journey maps/roadmaps, custom form renderers, and onboarding wizard. |
| **Evelyn Ang** | Member | **AI Architecture & Grounding**: Developing the Gemini-powered public services assistant, configuring prompt instructions with structured JSON schema outputs, and grounding LLM replies using the official Malaysian Government Knowledge Base. |
| **Teoh Xin Yee** | Member | **Data Pipeline & State Integration**: Implementing dependency-aware journey validation logic, local storage offline-cache synchronization, and data scraper/enricher scripts using Playwright. |
| **Toh Shee Thong** | Member | **Cloud Infrastructure & Database Architecture**: Configuring Firebase services, Firestore database rules, GCP Vertex AI API credentials, and project deployment infrastructure. |


---

## 📋 Project Overview

### Problem Statement
While government services are rapidly going digital, the journey remains complex and highly disconnected for citizens and businesses alike. Currently, there are:
* **14,273+ online government services** scattered across various portals.
* **51+ services across 19 different agencies** for standard citizen and business workflows.
* **2.2M+ MyGov users** interacting with these systems.

#### The Citizen's Burden:
* **Identifying the Right Agency**: Citizens must figure out which agency (e.g., JPN, JPJ, SSM, KKM, LHDN) handles their specific needs.
* **Endlessly Re-entering Information**: Manually typing in duplicate personal/business credentials (like NRIC, company name, address) on different web forms.
* **Switching Between Disconnected Platforms**: Manually shifting between various portals and agencies to complete a single macro journey (such as setting up an F&B outlet or getting an education loan).
* **Guessing Document & Eligibility Requirements**: Researching eligibility criteria, prerequisite files, and fee structures without clear guidance.
* **Monitoring Multiple Applications Separately**: Logging into separate platforms or checking disparate emails and SMS channels just to track progress.

> **"The government has digitised the services. Now, we need to digitise the journey."**

<sub>*Sources & References:*<br/>
1. [RMK13 Main Document e-Book](https://rmk13.ekonomi.gov.my/wp-content/uploads/2025/09/120925-Main-Document-e-Book.pdf)<br/>
2. [MyGOV Malaysia Application Statistics (2.2M+ Users)](https://www.digital.gov.my/en-GB/siaran/Aplikasi-MyGOV-Malaysia-Capai-2.2-Juta-Pengguna%2CPerluas-Penawaran-Digital-Dengan-Penstriman-Langsung-Piala-Dunia-FIFA-2026)</sub>


### 💡 Proposed Solution
MyGateway transforms complex government bureaucracy into a simple, guided, and seamless digital experience for every citizen by delivering a three-pillared solution:

#### 🤖 AI-Powered Assistant (Grounded Guidance)
* **Step-by-Step Journey Planner (Smart Roadmap)**: Automatically breaks complex multi-agency procedures into clear, sequential steps and highlights parallel tasks to optimize citizen time.
* **Voice & Bilingual Support (BM & English)**: Facilitates natural conversations using real-time voice input (Speech-to-Text) and vocal responses (Text-to-Speech) in both Bahasa Melayu and English.
* **Instant Eligibility & Document Checklist**: Automatically checks citizen criteria and generates prerequisite document requirements (e.g., NRIC, certifications, local permits) before application to prevent agency rejections.

#### 📊 Centralized Application Tracking (Zero Portal-Hopping)
* **Unified Cross-Agency Dashboard**: Consolidates all applications into a single central citizen dashboard with real-time status synchronization across federal and local agencies, serving as a single source of truth.
* **Comprehensive Requirements & Stage Details**: Provides upfront checklists, transparent fees, expected timelines (SLAs), and clear stage-by-stage roadmaps before citizens apply.
* **First-Time-Right Submissions**: Empower citizens with exact preparation lists, cost details, and step expectations to ensure error-free submissions on their first try.

#### 🔔 Proactive Alerts & Personalized Recommendations
* **Multi-Channel SMS & Push Delivery**: Delivers instant SMS text alerts and portal notifications directly to the citizen's mobile device, ensuring updates are never missed.
* **Time-Sensitive Expiry Reminders**: Sends proactive heads-up warnings well in advance of upcoming critical deadlines, such as driving license or road tax renewals.
* **Automated Demographic Profiling**: Safely extracts citizen context and age/gender indicators from verified MyKad NRIC, eliminating tedious manual profile questionnaires.
* **Prominent Top-of-Page Discovery**: Renders personalized suggestions right at the top of the Services Page, matching the user profile to save them from manually searching through 370+ digital services.


### 🎯 Target Users
MyGateway is custom-tailored to serve two primary user cohorts:

#### 👤 Citizens (Manage Personal Government Needs)
* **Access and Manage a Unified Personal Profile**: Consolidate core identity and socio-economic details (PADU, EPF, JPN, JPJ records) into one central, secure repository.
* **Apply for Personal Services, Licences, Permits, & Assistance**: File for Competent Driving Licence (CDL) renewals, PTPTN education loans, or STR cash assistance seamlessly.
* **Ask AI "What do I need to do?"**: Type or speak a personal query to receive a tailored, step-by-step guide matching your specific profile eligibility.
* **Automatically Reuse Verified Personal Information**: Say goodbye to forms; previously entered identity documents and credentials automatically populate new applications.
* **Track Personal Applications & Renewals**: Stay on top of application approvals and receive alerts for upcoming license expirations.

#### 🏢 Businesses (Navigate Complex Regulatory Processes)
* **Manage Business Identity, Documents, & Credentials**: Keep company registration details, PBT premise permits, and JAKIM Halal certificates organized in a central cockpit.
* **Identify Processes via Goal-Oriented AI**: State a business goal (e.g., "I want to open a boutique hotel") and let the AI map out the required regulatory procedures.
* **Discover Required Registrations, Licences, & Compliance**: View requirements and submit forms for SSM registrations, local council signage, and LHDN tax setups.
* **Coordinate Multi-Agency Business Applications**: Manage complex workflows where succeeding applications depend on certificates or approvals generated by upstream agencies.
* **Track Approvals, Renewals, & Compliance Deadlines**: Set up notifications and alerts to ensure your business remains compliant and avoids renewal penalties.

### 📈 Market & Social Opportunity
* **Reducing Red Tape**: Entrepreneurs face significant administrative delays. According to the World Bank, reducing licensing times directly boosts SME creation.
* **Digital Government Adoption**: The Malaysian government is actively driving MyDigital ID and PADU integration. MyGateway serves as the ultimate consumer-facing application layer that aggregates and proves the value of these integrated services.
* **Inclusivity & Accessibility**: By providing voice-guided search in both English and Bahasa Melayu, MyGateway lowers the barrier for rural, elderly, or visually impaired citizens seeking aid (like STR/SARA).

### 🚀 Breakthrough Innovation & Methodology
Unlike traditional portals that present static links, MyGateway introduces a **totally new paradigm** by transitioning from search-driven public portals to AI-orchestrated government journeys:

| Stage | Traditional Portals: Service-by-Service | MyGateway: Goal-to-Completion |
| :--- | :--- | :--- |
| **User Mindset** | User has to **understand how government works** to find specific services. | User describes a **goal** and let the AI find what is needed. |
| **Discovery** | Manual keyword searching and finding separate agencies. | **AI Understands Intent**: Identifies user goals, context, and eligibility automatically. |
| **Planning** | Unclear prerequisites, missing documents, and ordering. | **AI Maps the Journey**: Determines the agencies, requirements, and dependencies. |
| **Form Entry** | Endlessly filling in duplicate information across forms. | **AI Reuses Information**: Automatically pulls verified data from the centralized profile. |
| **Coordination** | Handled manually; portal-hopping across separate agency sites. | **AI Orchestrates**: Coordinates multiple applications and identifies missing information. |
| **Approval** | Disconnected approvals and status checks. | **Human Approval**: User reviews data sharing and approves critical submissions. |
| **Tracking** | Tracking applications separately. | **One Unified Journey**: Track the entire process in MyGateway. |

#### What Makes MyGateway Innovative?
* **Goal-Based Interaction**: Users describe what they want to achieve, not which government service they need.
* **Cross-Agency AI Orchestration**: AI connects multiple separate government processes into one end-to-end journey.
* **Intelligent Data Reuse**: One verified profile eliminates repetitive information entry across participating services.
* **Human-Controlled AI**: AI coordinates the workflow while the user remains in control of data sharing and submission.


### 💡 System Features

| Feature | Explanation |
| :--- | :--- |
| **Grounded AI Assistant** | Uses Google Gemini to parse government requirements, outputting structured JSON journeys, eligibility, and action cards. |
| **Multilingual Voice Control** | WebSockets-based real-time Speech-to-Text (STT) and Text-to-Speech (TTS) voice engines for hands-free navigation. |
| **Dependency Journey Map** | A visual roadmap that unlocks application phases sequentially, tracking complete vs locked steps. |
| **Dynamic Form Autofill** | Pulls demographic data from JPN/PADU profiles and passes completed step outputs to subsequent application forms. |
| **Onboarding Wizard** | Validates MyKad format against date of birth and builds a central socio-economic profile on first log in. |
| **Playwright Scraper Pipeline** | High-fidelity node crawler that scrapes, cleans, categorizes, and updates public services in Firestore. |

---

## 🏗️ System Architecture

<p align="center">
  <img src="src/assets/Technical%20Architecture.png" alt="Technical Architecture" width="800" />
</p>


* **Frontend**: Single Page Application built on React 19 and Vite 5. Tailored UI styling via pure CSS variables, responsive design, and Lucide icons. Form parser compiles Markdown to HTML with custom safe links using `marked`.
* **Backend**: Vite dev server custom middleware handler (`vite.config.js`) hosting WebSocket endpoints and HTTP routes, eliminating separate backend process overhead.
* **Database & Auth**: Firebase client-side SDK connected to Firestore for persisting user journeys, central profiles, and scraped services.

---

## 🛠️ Technologies Used

* **Frontend**: React 19, Vite 5, CSS Variables, Lucide Icons, Marked (GFM renderer).
* **Backend & Dev Server**: Node.js, Express-style Vite Middlewares, ws (WebSocket Server).
* **AI & Voice Services**: Google Cloud Vertex AI Client, Google Cloud Speech-To-Text V2, Google Cloud Text-To-Speech.
* **Database & Storage**: Firebase Web Client SDK, Firestore, Firebase Admin SDK (Node helper).
* **Automation & Ingestion**: Playwright Chromium Crawler.

---

## 🧩 Challenges and Approaches

### 1. Zero-Hallucination Government Guidelines
* **Challenge**: Large Language Models often hallucinate government fees, required documents, or links, which would lead to incorrect citizen submissions.
* **Approach**: We implemented local RAG grounding. Prompts sent to Gemini are formatted with `MALAYSIAN_GOV_KNOWLEDGE_BASE` containing verified details. If the API fails or is offline, the client automatically falls back to static JSON response cards in `govAiData.js` to ensure the platform remains fully functional.

### 2. Multi-Agency Friction & Dynamic Autofill
* **Challenge**: Re-entering the same information (like company registers and MyKad details) across separate agency applications is time-consuming and prone to errors.
* **Approach**: We developed the Centralized Profile Store (`profileStore.js`). Completed application steps produce `submissionOutput` artifacts (e.g. an SSM registration number). When the user accesses the next step (like DBKL Signboard License), the workspace extracts these artifacts and pre-populates the forms automatically.

### 3. Voice Transcription & Regional Accent Standardization
* **Challenge**: Cloud speech recognizers struggle with Malaysian accents and local department acronyms (like JPJ, LHDN, PERKESO, SSM).
* **Approach**: We deployed a hybrid system: utilizing browser Web Speech API for instant client-side rendering, and a WebSocket pipeline streaming raw audio chunks to Google Cloud Speech-to-Text V2. We added client and server-side acronym regex normalization (`formatAcronyms`) to instantly standardize phonetics (e.g. "jay p jay" or "jpg" to "JPJ").

---

## 💻 Usage Instructions

### 1. Prerequisites
* **Node.js**: Version 18.0.0 or higher.
* **Firebase Project**: An active Firestore database.

### 2. Installation & Setup

**Clone the Repository**:
```bash
git clone <repository-url>
cd MyGateway
```

**Install Dependencies**:
```bash
npm install
```

**Configure Credentials**:
1. Place your Firebase Web Configuration keys in [src/firebase.js](file:///c:/Users/nguxi/Downloads/MyGateway/src/firebase.js).
2. Save your Google Cloud Service Account JSON key (enabling Vertex AI, Speech, and TTS APIs) to `credentials/google.json`.
3. Save your Firebase Admin Service Account JSON key to `credentials/firebase.json` (required only for running data scraper/importer scripts).

### 3. Running Locally

**Start the Vite Dev & API Server**:
```bash
npm run dev
```
* Vite will run the client app and mount the API middleware on `http://localhost:5173`.



---

## 🌍 Social Impact & SDG Alignment

### 🕊️ SDG 16: Peace, Justice and Strong Institutions
MyGateway promotes inclusive, transparent, and accountable public services by simplifying cross-agency processes while giving citizens control and visibility over how their information is used.

### 👥 Making Digital Government More Accessible & Inclusive for Citizens
MyGateway addresses the core needs of citizens through four dimensions of social impact:

* **Equal Access to Government Services**:
  - Reduces the need to understand complex and fragmented administrative procedures.
  - Guides citizens directly to the right services and eligibility requirements.
* **Improved Quality of Life**:
  - Saves time spent on repetitive, manual administrative tasks.
  - Reduces stress, friction, and confusion when dealing with government departments.
* **Greater Citizen Empowerment & Trust**:
  - Gives citizens direct control over their personal information and credentials.
  - Provides full transparency on application progress and data-access status.
* **Greater Social & Economic Participation**:
  - Makes business registration and local licensing easier, fostering entrepreneurship.
  - Improves access to government programs, educational loans (PTPTN), and financial assistance (STR/SARA).


---

## 🔮 Future Improvements

1. **Production MyDigital ID Integration**: Connect simulated authentication to production OpenID Connect (OIDC) endpoints.
2. **PADU API Synchronization**: Securely sync socio-economic statuses in real time.
3. **Production Agency Webhook Handlers**: Connect the forms directly to mock or sandbox staging API endpoints of government agencies.
4. **Enhanced Offline Mode**: Support offline document preparation using local IndexedDB.

---

## 🎯 Implementation Plan

To scale MyGateway to a national production system:
* **Phase 1 (Centralized Profile & Auth)**: Integrate MyDigital ID auth simulation and design the 4-step Onboarding Wizard for core citizen profile setup.
* **Phase 2 (Scraping & Data Ingestion)**: Scrape and parse official Malaysian digital services from the government portal, mapping them to categories and storing them in Firestore.
* **Phase 3 (Grounded AI Assistant & Voice)**: Implement the Gemini-grounded chat system with voice dictation (STT) and reading assistant (TTS), converting chat plans into active citizen journeys.
* **Phase 4 (Workspace & Form Pre-population)**: Design the service workspace, lock/unlock dependencies, and build the dynamic carry-over context system to autofill forms from prior step artifacts.
