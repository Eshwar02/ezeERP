"""Blueprint registration for ezeERP."""
from routes.auth_routes import auth_bp
from routes.company_routes import company_bp
from routes.masters_routes import masters_bp
from routes.voucher_routes import voucher_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(company_bp, url_prefix="/api/companies")
    app.register_blueprint(masters_bp, url_prefix="/api/masters")
    app.register_blueprint(voucher_bp, url_prefix="/api/vouchers")
