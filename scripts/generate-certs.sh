#!/bin/bash

CERT_DIR="./certs"

mkdir -p "$CERT_DIR"

echo "Generating self-signed SSL certificates..."

openssl genrsa -out "$CERT_DIR/key.pem" 2048

openssl req -new -key "$CERT_DIR/key.pem" -out "$CERT_DIR/csr.pem" \
    -subj "/C=PL/ST=State/L=City/O=Organization/OU=Department/CN=localhost"

openssl x509 -req -days 365 -in "$CERT_DIR/csr.pem" \
    -signkey "$CERT_DIR/key.pem" -out "$CERT_DIR/cert.pem" \
    -extfile <(printf "subjectAltName=DNS:localhost,IP:127.0.0.1")

rm "$CERT_DIR/csr.pem"

chmod 644 "$CERT_DIR/cert.pem"
chmod 600 "$CERT_DIR/key.pem"

echo "SSL certificates generated successfully in $CERT_DIR/"
echo "cert.pem - Certificate file"
echo "key.pem  - Private key file"
echo ""
echo "Note: These are self-signed certificates for development only."
echo "Your browser will show a security warning. You can safely proceed."
