<!-- ░░░░░░░░░░░░░░░░░░░░░░░░  ezeERP  ░░░░░░░░░░░░░░░░░░░░░░░░ -->

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:4f46e5,100:06b6d4&height=200&section=header&text=ezeERP&fontSize=80&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=ERP%20made%20ridiculously%20easy&descAlignY=58&descSize=20" width="100%" />

<a href="https://github.com/Eshwar02/ezeERP">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=2800&pause=900&color=06B6D4&center=true&vCenter=true&width=620&lines=Billing+%E2%80%A2+Inventory+%E2%80%A2+Accounting;Multi-company+%E2%80%A2+GST-ready+%E2%80%A2+Reports;Keyboard-first.+Mouse+optional." alt="Typing SVG" />
</a>

<br/>

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
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
        │   "I have 3 ledgers, 47 stock items, GST     │
        │    due Friday, and a calculator from 2009."  │
        └─────────────────────────────────────────────┘
                          │
            (•_•)         │  ...enter ezeERP
           <)   )╯        ▼
            /   \    ╔══════════════════════════╗
                     ║  type. tab. done.  ⌨️     ║
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
| 🧾 **Vouchers** | Sales & purchase entry, keyboard-driven |
| 📦 **Inventory** | Live stock updates on every transaction |
| 🧮 **Accounting** | Double-entry ledgers that actually balance |
| 🧷 **GST** | GST-ready records & compliance scaffolding |
| 📊 **Reports** | Export to PDF (ReportLab) & Excel (OpenPyXL) |
| ⌨️ **Shortcuts** | Tally-style keyboard-first navigation |

---

## 🛠️ Tech Stack

```text
        FRONTEND                BACKEND                 DATA
   ┌───────────────┐      ┌────────────────┐      ┌──────────────┐
   │  Next.js 15   │◄────►│  FastAPI       │◄────►│ PostgreSQL   │
   │  React 19     │ HTTP │  SQLAlchemy    │ ORM  │              │
   │  TypeScript   │ JSON │  Alembic       │      │  + exports:  │
   │  TanStack Tbl │      │  Pydantic      │      │  📄 ReportLab │
   │  Tailwind CSS │      │  JWT (jose)    │      │  📊 OpenPyXL  │
   └───────────────┘      └────────────────┘      └──────────────┘
```

- **Backend:** FastAPI · SQLAlchemy · Alembic · Pydantic-Settings · python-jose · passlib[bcrypt]
- **Frontend:** Next.js · React · TypeScript · TanStack Table · clsx · tailwind-merge
- **Database:** PostgreSQL (`psycopg`)
- **Exports:** ReportLab (PDF) · OpenPyXL (Excel)
- **Deploy:** Docker

---

## 🗂️ Architecture

```text
ezeERP/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # auth, companies, masters, billing, gst, reports…
│   │   ├── core/              # config, database, security
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── services/          # business logic
│   ├── routes/                # Flask-style route handlers
│   └── requirements.txt
└── frontend/
    └── src/
        ├── app/               # login, companies, masters, vouchers…
        ├── components/        # DataTable, MasterCrud, VoucherForm, Shell
        └── lib/               # api client, shortcuts, utils
```

---

## 🚀 Quick Start

<details open>
<summary><b>⚙️ Backend (FastAPI)</b></summary>

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000  (docs at /docs)
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
[✓] Masters (ledgers…)        [ ] Invoice generation
[ ] Basic reports             [✓] Keyboard-first navigation
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

**Built with ☕ and keyboard shortcuts** · [Eshwar02/ezeERP](https://github.com/Eshwar02/ezeERP)

</div>
