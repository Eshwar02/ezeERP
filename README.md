# ezeERP

SmartERP-style billing, inventory, accounting, GST, and business management clone.

## Stack

- **Backend:** FastAPI + SQLAlchemy + Alembic
- **Frontend:** Next.js + React
- **Database:** PostgreSQL
- **Exports:** ReportLab, OpenPyXL
- **Deploy:** Docker

## Architecture

```text
backend/
  app/
    api/v1/endpoints/
    core/
    models/
    schemas/
    services/
frontend/
  src/app/
  src/components/
  src/lib/
```

## MVP scope

1. Authentication
2. Company selection
3. Masters: ledgers, groups, stock items, units
4. Sales and purchase vouchers
5. Inventory updates
6. Invoice generation
7. Basic reports
8. Keyboard-first navigation

