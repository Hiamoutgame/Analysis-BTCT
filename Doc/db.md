## 1. LumiFin DB

- **Hostname:** dpg-d6lp7dp4tr6s7383i8og-a
- **Port:** 5432
- **Database:** lumifin_db
- **Username:** lumifin_db_user
- **Password:** x9O9CiWzJWkq6jtySmhw7J7VlRLCbJjh
- **External Database URL:** postgresql://lumifin_db_user:x9O9CiWzJWkq6jtySmhw7J7VlRLCbJjh@dpg-d6lp7dp4tr6s7383i8og-a.singapore-postgres.render.com/lumifin_db
- **Security note:** Move password to environment variables (`.env`) and rotate the secret if this file was pushed publicly.




-- ==============================================================================
-- FINTECH PROJECT: AI-POWERED FINANCIAL STATEMENT ANALYSIS, FORECASTING,
-- AND FRAUD ALERT SYSTEM
-- Database: PostgreSQL
-- ==============================================================================

-- ==============================================================================
-- EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==============================================================================
-- COMMON FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- GROUP 0: AUTHENTICATION & AUTHORIZATION
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS app_user (
    user_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(120),
    role user_role NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_app_user_updated_at ON app_user;
CREATE TRIGGER trg_app_user_updated_at
BEFORE UPDATE ON app_user
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO app_user (email, password_hash, full_name, role)
VALUES ('admin@lumifin.local', '$2b$12$replace_this_with_real_bcrypt_hash', 'System Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- GROUP 1: MASTER DATA & NORMALISATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS industry (
    industry_code VARCHAR(50) PRIMARY KEY,
    industry_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS map_category_code_universal (
    category_code VARCHAR(50) PRIMARY KEY,
    corp VARCHAR(255),
    corp_code VARCHAR(50),
    securities VARCHAR(255),
    sec_code VARCHAR(50),
    bank VARCHAR(255),
    bank_code VARCHAR(50),
    en_caption VARCHAR(255),
    parent_code VARCHAR(50) REFERENCES map_category_code_universal(category_code),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS map_category_code_ratio (
    ratio_code VARCHAR(50) PRIMARY KEY,
    ratio_name VARCHAR(255) NOT NULL,
    function_name VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS map_category_code_explanation (
    category_code VARCHAR(50) PRIMARY KEY,
    vi_caption VARCHAR(255) NOT NULL,
    en_caption VARCHAR(255),
    parent_code VARCHAR(50) REFERENCES map_category_code_explanation(category_code),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_info (
    stock_code VARCHAR(20) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    en_short_name VARCHAR(100),
    industry_code VARCHAR(50) REFERENCES industry(industry_code),
    exchange VARCHAR(20),
    stock_indices VARCHAR(50),
    is_bank BOOLEAN NOT NULL DEFAULT FALSE,
    is_security BOOLEAN NOT NULL DEFAULT FALSE,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_company_info_updated_at ON company_info;
CREATE TRIGGER trg_company_info_updated_at
BEFORE UPDATE ON company_info
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION company_info_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        to_tsvector(
            'simple',
            coalesce(NEW.stock_code, '') || ' ' ||
            coalesce(NEW.company_name, '') || ' ' ||
            coalesce(NEW.short_name, '') || ' ' ||
            coalesce(NEW.en_short_name, '')
        );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_company_info_search_vector ON company_info;
CREATE TRIGGER trg_company_info_search_vector
BEFORE INSERT OR UPDATE ON company_info
FOR EACH ROW
EXECUTE FUNCTION company_info_search_vector_update();

CREATE TABLE IF NOT EXISTS company_related_party (
    id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL REFERENCES company_info(stock_code) ON DELETE CASCADE,
    invest_on VARCHAR(255) NOT NULL,
    ownership_percent NUMERIC(5,2) CHECK (ownership_percent >= 0 AND ownership_percent <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- GROUP 2: CORE FACT TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS financial_statement (
    id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL REFERENCES company_info(stock_code) ON DELETE CASCADE,
    category_code VARCHAR(50) NOT NULL REFERENCES map_category_code_universal(category_code) ON DELETE RESTRICT,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL CHECK (quarter BETWEEN 0 AND 4),
    value NUMERIC(20,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_financial_statement UNIQUE (stock_code, category_code, year, quarter)
);

CREATE TABLE IF NOT EXISTS financial_statement_explanation (
    id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL REFERENCES company_info(stock_code) ON DELETE CASCADE,
    category_code VARCHAR(50) NOT NULL REFERENCES map_category_code_explanation(category_code) ON DELETE RESTRICT,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL CHECK (quarter BETWEEN 0 AND 4),
    value NUMERIC(20,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_financial_statement_explanation UNIQUE (stock_code, category_code, year, quarter)
);

CREATE TABLE IF NOT EXISTS financial_ratio (
    id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL REFERENCES company_info(stock_code) ON DELETE CASCADE,
    ratio_code VARCHAR(50) NOT NULL REFERENCES map_category_code_ratio(ratio_code) ON DELETE RESTRICT,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL CHECK (quarter BETWEEN 0 AND 4),
    value NUMERIC(20,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_financial_ratio UNIQUE (stock_code, ratio_code, year, quarter)
);

-- ==============================================================================
-- GROUP 3: INDUSTRY AGGREGATES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS industry_financial_statement (
    id BIGSERIAL PRIMARY KEY,
    industry_code VARCHAR(50) NOT NULL REFERENCES industry(industry_code) ON DELETE CASCADE,
    category_code VARCHAR(50) NOT NULL REFERENCES map_category_code_universal(category_code) ON DELETE RESTRICT,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL CHECK (quarter BETWEEN 0 AND 4),
    data_sum NUMERIC(20,4),
    data_mean NUMERIC(20,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_industry_financial_statement UNIQUE (industry_code, category_code, year, quarter)
);

CREATE TABLE IF NOT EXISTS industry_financial_statement_explanation (
    id BIGSERIAL PRIMARY KEY,
    industry_code VARCHAR(50) NOT NULL REFERENCES industry(industry_code) ON DELETE CASCADE,
    category_code VARCHAR(50) NOT NULL REFERENCES map_category_code_explanation(category_code) ON DELETE RESTRICT,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL CHECK (quarter BETWEEN 0 AND 4),
    data_sum NUMERIC(20,4),
    data_mean NUMERIC(20,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_industry_financial_statement_explanation UNIQUE (industry_code, category_code, year, quarter)
);

CREATE TABLE IF NOT EXISTS industry_financial_ratio (
    id BIGSERIAL PRIMARY KEY,
    industry_code VARCHAR(50) NOT NULL REFERENCES industry(industry_code) ON DELETE CASCADE,
    ratio_code VARCHAR(50) NOT NULL REFERENCES map_category_code_ratio(ratio_code) ON DELETE RESTRICT,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL CHECK (quarter BETWEEN 0 AND 4),
    data_sum NUMERIC(20,4),
    data_mean NUMERIC(20,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_industry_financial_ratio UNIQUE (industry_code, ratio_code, year, quarter)
);

-- ==============================================================================
-- GROUP 4: AI ANALYTICS & INSIGHTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS fraud_detection_log (
    log_id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL REFERENCES company_info(stock_code) ON DELETE CASCADE,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL CHECK (quarter BETWEEN 0 AND 4),
    model_used VARCHAR(100),
    risk_score NUMERIC(5,2) CHECK (risk_score >= 0 AND risk_score <= 100),
    anomaly_type VARCHAR(100),
    red_flags_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cash_flow_assessment (
    assessment_id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL REFERENCES company_info(stock_code) ON DELETE CASCADE,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL CHECK (quarter BETWEEN 0 AND 4),
    fcf_margin NUMERIC(10,4),
    earnings_quality_ratio NUMERIC(10,4),
    cash_burn_rate NUMERIC(20,4),
    insight_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cash_flow_assessment UNIQUE (stock_code, year, quarter)
);

CREATE TABLE IF NOT EXISTS forecast_scenario (
    scenario_id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL REFERENCES company_info(stock_code) ON DELETE CASCADE,
    base_year INT NOT NULL,
    projected_year INT NOT NULL,
    scenario_type VARCHAR(50) NOT NULL CHECK (scenario_type IN ('bull', 'base', 'bear')),
    assumptions_json JSONB,
    projected_metrics_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_company_info_search_vector
    ON company_info USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS idx_financial_statement_lookup
    ON financial_statement (stock_code, year, quarter);

CREATE INDEX IF NOT EXISTS idx_financial_statement_category
    ON financial_statement (category_code, year, quarter);

CREATE INDEX IF NOT EXISTS idx_financial_ratio_lookup
    ON financial_ratio (stock_code, year, quarter);

CREATE INDEX IF NOT EXISTS idx_financial_ratio_code
    ON financial_ratio (ratio_code, year, quarter);

CREATE INDEX IF NOT EXISTS idx_fraud_detection_log_lookup
    ON fraud_detection_log (stock_code, year, quarter);

CREATE INDEX IF NOT EXISTS idx_company_related_party_stock_code
    ON company_related_party (stock_code);

CREATE INDEX IF NOT EXISTS idx_company_info_industry_code
    ON company_info (industry_code);

