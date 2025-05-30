# server.py

import http.server
import socketserver
import socket
import os

def start_web_server():
    PORT = 8000
    WEB_DIR = os.path.join(os.path.dirname(__file__), '../')
    Handler = http.server.SimpleHTTPRequestHandler
    local_ip = socket.gethostbyname(socket.gethostname())
    os.chdir(WEB_DIR)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        host, port = httpd.server_address
        print(f"Serving HTTP at {local_ip}:{port}")
        httpd.serve_forever()

if __name__ == "__main__":
    start_web_server()
