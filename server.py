#!/usr/bin/env python3
"""
开发任务管理系统后端
提供 REST API 存储任务数据到 JSON 文件
"""
import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from datetime import datetime

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'tasks.json')

# 确保 data 目录存在
os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)

# 初始化数据文件
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f, ensure_ascii=False, indent=2)

class TaskHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/tasks':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            try:
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except:
                data = []
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
        else:
            # Serve static files
            return SimpleHTTPRequestHandler.do_GET(self)
    
    def do_POST(self):
        if self.path == '/api/tasks':
            length = int(self.headers.get('content-length', 0))
            body = self.rfile.read(length)
            try:
                tasks = json.loads(body.decode('utf-8'))
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(tasks, f, ensure_ascii=False, indent=2)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

PORT = 8080
server = HTTPServer(('', PORT), TaskHandler)
print(f'🚀 开发任务管理系统已启动: http://localhost:{PORT}')
print(f'📁 数据文件: {DATA_FILE}')
server.serve_forever()
