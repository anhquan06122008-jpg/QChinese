FROM python:3.12-slim

WORKDIR /app
COPY . .

ENV PORT=8000
ENV HOST=0.0.0.0
EXPOSE 8000

VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=3)" || exit 1

CMD ["python", "server.py"]
