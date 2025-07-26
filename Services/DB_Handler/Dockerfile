FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install alembic psycopg2-binary

COPY . .

CMD ["python", "main.py"]