import os
import subprocess
import time
import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from models import Base
from alembic.config import Config
from alembic import command

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:admin@postgres_container:5432/ScamSleuth_db"
)


def create_database_if_missing():
    url = make_url(DATABASE_URL)
    db_name = url.database

    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=url.username,
            password=url.password,
            host=url.host,
            port=url.port
        )
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        exists = cur.fetchone()
        if not exists:
            print(f"🧱 Database '{db_name}' not found. Creating it...")
            cur.execute(f'CREATE DATABASE "{db_name}"')
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Failed to create database: {e}")
        raise


def ensure_alembic_config():
    alembic_ini_exists = os.path.exists("alembic.ini")
    env_py_exists = os.path.exists(os.path.join("alembic", "env.py"))

    if not alembic_ini_exists or not env_py_exists:
        print("🛠 Alembic not initialized. Setting it up...")

        if not alembic_ini_exists and os.path.exists("alembic"):
            print("🧹 Removing leftover alembic folder...")
            import shutil
            shutil.rmtree("alembic")

        subprocess.run(["alembic", "init", "alembic"], check=True)

        with open("alembic.ini", "r") as file:
            lines = file.readlines()
        with open("alembic.ini", "w") as file:
            for line in lines:
                if line.strip().startswith("sqlalchemy.url"):
                    file.write(f"sqlalchemy.url = {DATABASE_URL}\n")
                else:
                    file.write(line)

        env_path = os.path.join("alembic", "env.py")
        with open(env_path, "r") as f:
            content = f.read()
        content = content.replace(
            "target_metadata = None",
            "from models import Base\n" + "target_metadata = Base.metadata"
        )
        with open(env_path, "w") as f:
            f.write(content)


def generate_and_apply_migration():
    print("📦 Generating Alembic migration...")
    try:
        subprocess.run(["alembic", "revision", "--autogenerate", "-m", "auto"], check=True)
    except subprocess.CalledProcessError as e:
        print("⚠️ Migration not created. Maybe no changes were detected.")

    print("🚀 Applying latest migration...")
    subprocess.run(["alembic", "upgrade", "head"], check=True)


def init_db():
    print("🔌 Connecting to database...")
    create_database_if_missing()
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)  # In case some tables are brand new
    ensure_alembic_config()
    generate_and_apply_migration()
    print("✅ Database is synced with ORM models.")


if __name__ == "__main__":
    init_db()
    time.sleep(5)  # Optional: Let logs print before container exits
