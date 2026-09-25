# Reddy Medical Group, Inc. — Official Digital Practice Hub & Suite Navigator™

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![HIPAA](https://img.shields.io/badge/HIPAA-Safe%20Static%20Architecture-teal.svg)]()
[![Schema](https://img.shields.io/badge/Schema.org-MedicalClinic%20%26%20Physician-orange.svg)]()

Official website and digital patient arrival hub for **Reddy Medical Group, Inc.** located at **Meridian Professional Center** in Fresno, California.

---

## 🏥 Practice Overview

* **Physicians:**
  * **Dr. Kiran Manthani Reddy, MD** — Internal Medicine Specialist & Hospitalist (ABIM Certified, 30+ yrs experience, CA Lic. `#A055459`, NPI-1: `1588778435`)
  * **Dr. Manthani Padmanabh Reddy, MD** — Infectious Disease Specialist (ABIM Certified, CA Lic. `#A49497`)
* **Practice Organization:** Reddy Medical Group, Inc. (NPI-2: `1407995038`, Tax ID: `77-0476968`)
* **Location:** 7045 North Maple Avenue, Suites 101 & 108, Fresno, CA 93720-8008
* **Contact:** Phone: `(559) 326-7393` | Fax: `(559) 369-2488`
* **Hospital Affiliations:** Saint Agnes Medical Center (SAMC) & Community Medical Centers (CRMC & Clovis Community)

---

## 🌟 Key Features

### 1. Modern, Responsive Medical Website (`index.html`)
* **Zero-Liability / HIPAA-Safe Static Architecture:** Built entirely in clean HTML5, CSS3, and modern vanilla JavaScript. No external contact databases, PHI collection, or insecure forms to compromise patient privacy.
* **Full Medical Schema.org JSON-LD Structured Data:** Embedded high-authority schema markup (`MedicalClinic` and `Physician` types) with verified NPI numbers, geocoordinates, operating hours, and accepted insurance networks to reinforce Google Local Map Pack and Knowledge Panel verification.
* **Practice Disambiguation Banner:** Proactively resolves online confusion between Dr. Kiran Manthani Reddy in Fresno and similarly named practitioners (such as Dr. H. Kiran Kumar Reddy in Hanford/Visalia or Reddy Medical Group in Georgia).
* **Direct Patient Portal Access:** Direct routing for patients to Saint Agnes Medical Center / Trinity Health and Community Medical Centers MyChart portals.

### 2. Dual-Suite Logistics & Suite Navigator™
Solves patient arrival confusion inside Meridian Professional Center:
* **Suite 101:** Clinical Examinations & Patient Check-In (Ground floor, ADA direct access)
* **Suite 108:** Administration, Billing & Corporate Inquiries
* **2D Satellite Arrival Guide (`suite-navigator/index.html`):** Interactive Leaflet.js map with ESRI high-resolution aerial imagery and step-by-step patient directions.
* **3D God's Eye Suite Navigator (`suite-navigator-3d/index.html`):** Real aerial telemetry camera angles, approach waypoints, and doorway targeting.

### 3. Business Development & Forensic Audit Documentation
* **`PITCH_PROPOSAL.md`:** Comprehensive executive proposal documenting live online errors, false "permanently closed" directory scrapers, misrouted faxes, and operational ROI.
* **`docs/Reddy_Medical_Group_Digital_Strategy.pdf`:** 10 MB presentation deck detailing the complete digital transformation strategy.

---

## 📁 Repository Structure

```
.
├── index.html                   # Main Reddy Medical Group practice website
├── styles.css                   # Custom clinical styling, typography & responsive layouts
├── script.js                    # Mobile navigation, suite switching & interaction logic
├── PITCH_PROPOSAL.md            # Executive proposal & live forensic web audit
├── README.md                    # Repository documentation
├── .gitignore                   # Standard git ignore definitions
│
├── suite-navigator/             # 2D High-Resolution Satellite Suite Navigator
│   └── index.html               # Leaflet + ESRI World Imagery arrival interface
│
├── suite-navigator-3d/          # 3D God's Eye Precision Telemetry Navigator
│   ├── index.html               # 3D HUD & camera mission viewport
│   ├── styles.css               # Obsidian glassmorphic styling
│   ├── app.js                   # Navigation telemetry & waypoint controller
│   └── meridian_satellite.jpg   # Satellite aerial imagery plate
│
├── docs/                        # Presentation & Strategy Deliverables
│   └── Reddy_Medical_Group_Digital_Strategy.pdf
│
└── [aerial assets]              # High-resolution Meridian Center aerial plates & PNGs
```

---

## 🚀 Quick Start / Local Preview

You can preview the site locally using any standard static server:

```powershell
# Using Python
python -m http.server 8000

# Using Node / npx
npx serve .
```

Then open `http://localhost:8000` in your web browser.

---

## 🌐 Deployment

Because this repository uses a static architecture, it can be deployed with zero hosting costs and SSL:
* **GitHub Pages:** Enable under **Settings > Pages > Branch: master (or main) / (root)**.
* **Cloudflare Pages / Vercel / Netlify:** Connect this GitHub repository with root directory `/` and output directory `./`.

---

## 📄 License & Attribution

Designed and developed for Reddy Medical Group, Inc. All rights reserved.
