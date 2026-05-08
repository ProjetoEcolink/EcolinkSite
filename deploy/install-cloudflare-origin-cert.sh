#!/usr/bin/env bash
set -euo pipefail

CERT_SRC="${1:-}"
KEY_SRC="${2:-}"
CERT_DIR="/etc/ssl/cloudflare"
CERT_DEST="${CERT_DIR}/ecolink.eco.br.pem"
KEY_DEST="${CERT_DIR}/ecolink.eco.br.key"

if [[ -z "${CERT_SRC}" || -z "${KEY_SRC}" ]]; then
  echo "Usage: $0 /path/to/origin-certificate.pem /path/to/private-key.key" >&2
  exit 1
fi

if [[ ! -f "${CERT_SRC}" ]]; then
  echo "Certificate file not found: ${CERT_SRC}" >&2
  exit 1
fi

if [[ ! -f "${KEY_SRC}" ]]; then
  echo "Private key file not found: ${KEY_SRC}" >&2
  exit 1
fi

sudo install -d -m 755 "${CERT_DIR}"
sudo install -m 644 "${CERT_SRC}" "${CERT_DEST}"
sudo install -m 600 "${KEY_SRC}" "${KEY_DEST}"

sudo openssl x509 -in "${CERT_DEST}" -noout -subject -issuer -dates
sudo openssl rsa -in "${KEY_DEST}" -check -noout >/dev/null

sudo nginx -t
sudo systemctl reload nginx

echo "Cloudflare Origin Certificate installed:"
echo "  ${CERT_DEST}"
echo "  ${KEY_DEST}"
