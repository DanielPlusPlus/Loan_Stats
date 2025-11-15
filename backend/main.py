from app import app
import os

if __name__ == "__main__":
    cert_path = '/app/certs/cert.pem'
    key_path = '/app/certs/key.pem'

    ssl_context = None
    if os.path.exists(cert_path) and os.path.exists(key_path):
        ssl_context = (cert_path, key_path)
        print("Starting server with HTTPS...")
    else:
        print("SSL certificates not found. Starting server with HTTP...")

    debug_mode = os.getenv('FLASK_DEBUG', '0') == '1'

    app.run(
        debug=debug_mode,
        host='0.0.0.0',
        port=5001,
        ssl_context=ssl_context,
        use_reloader=debug_mode
    )
