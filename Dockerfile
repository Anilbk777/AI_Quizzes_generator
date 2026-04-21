# ─────────────────────────────────────────────────────────────
# Stage 1: Builder
#   Compiles wheels for all dependencies.
#   gcc / build-essential are needed here but will NOT be
#   present in the final runtime image, keeping it lean.
# ─────────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /build

# Only install C build toolchain — no ffmpeg, no libpq (not used by this app)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Compile wheels for ALL packages (including transitive deps like lxml)
# --no-deps was intentionally removed: it caused C-extension transitive
# dependencies (e.g. lxml required by python-docx) to be skipped,
# making the runner-stage install fail with "no matching distribution".
RUN pip install --upgrade pip \
    && pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt


# ─────────────────────────────────────────────────────────────
# Stage 2: Runner
#   Minimal runtime image — no compiler, no dev tools.
#   Only installs pre-built wheels from the builder stage.
# ─────────────────────────────────────────────────────────────
FROM python:3.11-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Keep pip quiet in production logs
    PIP_NO_COLOR=1

WORKDIR /app

# Create a non-root user for security — never run production containers as root
RUN addgroup --system appgroup \
    && adduser --system --ingroup appgroup appuser

# Install wheels without hitting the internet — fast and reproducible
COPY --from=builder /wheels /wheels
COPY requirements.txt .

RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt \
    # Clean up wheels after install
    && rm -rf /wheels requirements.txt

# Copy application source, owned by the non-root user
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "2", \
     "--log-level", "info"]