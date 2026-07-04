<!-- ░░░░░░░░░░░░░░░░░░░░░░░░  ezeERP  ░░░░░░░░░░░░░░░░░░░░░░░░ -->

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:4f46e5,100:06b6d4&height=200&section=header&text=ezeERP&fontSize=80&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=ERP%20made%20ridiculously%20easy&descAlignY=58&descSize=20" width="100%" />

<a href="https://github.com/Eshwar02/ezeERP">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=2800&pause=900&color=06B6D4&center=true&vCenter=true&width=620&lines=Billing+%E2%80%A2+Inventory+%E2%80%A2+Accounting;Multi-company+%E2%80%A2+GST-ready+%E2%80%A2+Reports;Keyboard-first.+Mouse+optional." alt="Typing SVG" />
</a>

<br/>

![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 🏪 The Shopkeeper's Dilemma

```
        ┌─────────────────────────────────────────────┐
        │   "I have 3 ledgers, 47 stock items, GST    │
        │    due Friday, and a calculator from 2009." │
        └─────────────────────────────────────────────┘
                          │
            (•_•)         │  ...enter ezeERP
           <)   )╯        ▼
            /   \    ╔══════════════════════════╗
                     ║  type. tab. done.  ⌨️    ║
           \(•_•)/   ╚══════════════════════════╝
            (   (>      books balanced. 🎉
            /   \
```

> **ezeERP** is a SmartERP-style platform for **billing, inventory, accounting, GST, and
> business management** — built for people who'd rather press `Ctrl+S` than touch a mouse.

---

## ✨ What's Inside

| 🧰 Module | What it does |
|----------|--------------|
| 🔐 **Auth** | Email + password login, JWT-secured sessions |
| 🏢 **Companies** | Multi-company accounting under one roof |
| 📒 **Masters** | Ledgers, groups, stock items, units, customers, suppliers |
| 🧾 **Vouchers** | Sales, purchase, credit/debit notes, payment, receipt, journal, contra |
| 📦 **Inventory** | Live stock updates on every transaction |
| 🧮 **Accounting** | Double-entry ledgers that actually balance |
| 🧷 **GST** | GST-ready records & compliance scaffolding |
| 📊 **Reports** | Balance sheet, P&L, trial balance, stock, sales, purchase, GST |
| ⬇️ **Exports** | Every report → Excel (OpenPyXL); invoices → PDF (ReportLab) |
| ⌨️ **Shortcuts** | Tally-style keyboard-first navigation |

---

## 🛠️ Tech Stack

```text
        FRONTEND                BACKEND                 DATA
   ┌───────────────┐      ┌────────────────┐      ┌──────────────┐
   │  Next.js 15   │◄────►│  Flask         │◄────►│ SQLite / PG  │
   │  React 19     │ HTTP │  SQLAlchemy    │ ORM  │              │
   │  TypeScript   │ JSON │  Flask-JWT-Ext │      │  + exports:  │
   │  TanStack Tbl │      │  Flask-CORS    │      │  📄 ReportLab│
   │  Tailwind CSS │      │                │      │  📊 OpenPyXL │
   └───────────────┘      └────────────────┘      └──────────────┘
```

- **Backend:** Flask · SQLAlchemy · Flask-JWT-Extended · Flask-CORS
- **Frontend:** Next.js · React · TypeScript · TanStack Table · clsx · tailwind-merge
- **Database:** SQLite (dev) · PostgreSQL (`psycopg`, prod)
- **Exports:** ReportLab (PDF) · OpenPyXL (Excel)

---

## 🗂️ Architecture

```text
ezeERP/
├── backend/
│   ├── app.py                 # Flask entrypoint + app factory
│   ├── routes/                # auth, companies, masters, vouchers, accounting, reports
│   ├── models/                # SQLAlchemy models
│   ├── services/              # business logic (vouchers, ledger posting)
│   ├── utils/                 # invoice PDF + report Excel builders
│   ├── auth/ · config/ · database/
│   └── requirements.txt
└── frontend/
    └── src/
        ├── app/               # login, companies, masters, vouchers, reports…
        ├── components/        # DataTable, MasterCrud, VoucherForm, ExportButton, Shell
        └── lib/               # api client, keymap, shortcuts, utils
```

---

## 🚀 Quick Start

<details open>
<summary><b>⚙️ Backend (Flask)</b></summary>

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
# → http://localhost:5000  (health at /api/health)
```
</details>

<details open>
<summary><b>🖥️ Frontend (Next.js)</b></summary>

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```
</details>

---

## 🎯 MVP Scope

```
[✓] Authentication            [✓] Sales & purchase vouchers
[✓] Company selection         [✓] Inventory updates
[✓] Masters (ledgers…)        [✓] Invoice generation (PDF)
[✓] Reports + Excel export    [✓] Keyboard-first navigation
```

---

## ⌨️ Keyboard-First, Always

```
  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
  │ Alt │ │  N  │ │ Tab │ │Enter│ │Ctrl │ │  S  │
  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
   new      voucher   navigate   submit    save & go
```

> Hands on the keys. Eyes on the numbers. That's the whole idea.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:06b6d4,100:4f46e5&height=120&section=footer" width="100%" />

**Built with care** · [Eshwar02/ezeERP](https://github.com/Eshwar02/ezeERP)

</div>
