FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY requirements.lock ./
RUN pip install --no-cache-dir -r requirements.lock && useradd -u 10001 -m appuser && mkdir -p /app/data && chown -R appuser:appuser /app
COPY --chown=appuser:appuser server.py manage.py seed-notice.json ./
COPY --chown=appuser:appuser web ./web
COPY --chown=appuser:appuser admin ./admin
USER appuser
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "server:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--limit-concurrency", "8", "--no-proxy-headers", "--timeout-keep-alive", "5"]
