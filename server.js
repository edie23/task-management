const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8086;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

// 加载 .env 文件
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

// GitHub Gist 配置
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GIST_ID = null; // 首次运行会创建新 Gist，后续填写

// 确保 data 目录存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// GitHub Gist API 请求
function gistRequest(method, url, data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'TaskManagement/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    // 尝试解析 JSON
                    resolve(JSON.parse(body));
                } catch (e) {
                    // 如果不是 JSON，返回原始内容
                    resolve(body);
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// 读取 Gist 数据
async function loadFromGist() {
    try {
        // 尝试获取现有 Gist
        const response = await gistRequest('GET', 'https://api.github.com/gists');
        
        // 检查是否是数组
        let gists = [];
        if (Array.isArray(response)) {
            gists = response;
        } else if (response && typeof response === 'object') {
            gists = [response];
        }
        
        // 查找我们的 Gist
        const gist = gists.find(g => g.description === 'task-management-data');
        
        if (gist) {
            console.log('✅ 从 Gist 加载数据:', gist.id);
            const content = gist.files['tasks.json'].content;
            return JSON.parse(content);
        } else {
            console.log('📝 没有找到现有 Gist，将创建新的');
            return null;
        }
    } catch (e) {
        console.error('❌ 加载 Gist 失败:', e.message);
        return null;
    }
}

// 保存到 Gist
let currentGistId = null;

async function saveToGist(tasks) {
    try {
        const content = JSON.stringify(tasks, null, 2);
        const gistData = {
            description: 'task-management-data',
            public: false,
            files: {
                'tasks.json': {
                    content: content
                }
            }
        };

        let result;
        if (currentGistId) {
            // 更新现有 Gist
            result = await gistRequest('PATCH', `https://api.github.com/gists/${currentGistId}`, gistData);
        } else {
            // 创建新 Gist
            result = await gistRequest('POST', 'https://api.github.com/gists', gistData);
            currentGistId = result.id;
            // 保存 Gist ID 到本地文件
            fs.writeFileSync(path.join(dataDir, 'gist-id.txt'), result.id);
            console.log('✅ 创建新 Gist:', result.id);
        }
        
        console.log('✅ 已保存到 Gist');
        return true;
    } catch (e) {
        console.error('❌ 保存 Gist 失败:', e.message);
        return false;
    }
}

// 初始化：尝试从 Gist 加载数据
async function initData() {
    // 检查本地是否有 Gist ID
    const gistIdFile = path.join(dataDir, 'gist-id.txt');
    if (fs.existsSync(gistIdFile)) {
        currentGistId = fs.readFileSync(gistIdFile, 'utf8').trim();
    }

    // 尝试从 Gist 加载
    const gistData = await loadFromGist();
    
    if (gistData) {
        // 从 Gist 加载成功，写入本地备份
        fs.writeFileSync(DATA_FILE, JSON.stringify(gistData, null, 2), 'utf8');
        console.log('✅ 数据已从 Gist 恢复');
    } else if (fs.existsSync(DATA_FILE)) {
        // 没有 Gist，使用本地数据并创建 Gist
        console.log('📝 现有本地数据，创建 Gist...');
        const localData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        await saveToGist(localData);
    } else {
        // 没有任何数据，初始化
        const initialData = [
            {
                id: '1',
                name: 'PermissionCenter 数据库备注',
                status: 'done',
                branch: 'feature/2026/02/24/添加数据库备注',
                project: 'UFX.SCM.Cloud.PermissionCenter',
                description: '给没有备注的字段添加数据库备注',
                createdAt: '2026-02-24',
                reports: [
                    { agent: 'main', time: '2026-02-24', content: 'Boss 分配任务：给 PermissionCenter 项目添加数据库备注。' },
                    { agent: 'backdev', time: '2026-02-24', content: '完成！给 PermissionCenter 项目添加了数据库备注。共修改了 17 个文件，添加了 34 处 HasComment。编译通过，0 错误，421 警告。分支：feature/2026/02/24/添加数据库备注' }
                ],
                timeline: [
                    { time: '2026-02-24', action: '任务创建' },
                    { time: '2026-02-24', action: 'backdev 开发完成' },
                    { time: '2026-02-24', action: '编译通过 0错误' }
                ]
            }
        ];
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
        await saveToGist(initialData);
    }
}

const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API: 获取任务
    if (req.method === 'GET' && req.url === '/api/tasks') {
        try {
            // 优先从 Gist 获取最新数据
            const gistData = await loadFromGist();
            if (gistData) {
                // 更新本地缓存
                fs.writeFileSync(DATA_FILE, JSON.stringify(gistData, null, 2), 'utf8');
                res.writeHead(200, { 
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(gistData));
            } else {
                // 降级到本地文件
                const rawData = fs.readFileSync(DATA_FILE);
                const data = JSON.parse(rawData.toString('utf8'));
                res.writeHead(200, { 
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(data));
            }
        } catch (e) {
            // 降级到本地文件
            const rawData = fs.readFileSync(DATA_FILE);
            const data = JSON.parse(rawData.toString('utf8'));
            res.writeHead(200, { 
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(data));
        }
        return;
    }

    // API: 保存任务
    if (req.method === 'POST' && req.url === '/api/tasks') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const tasks = JSON.parse(body);
                
                // 保存到本地
                fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
                
                // 保存到 Gist（异步，不阻塞响应）
                saveToGist(tasks);
                
                res.writeHead(200, { 
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(500, { 
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    // 静态文件服务
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json'
    };

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
        res.end(data);
    });
});

// 启动服务器
initData().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 开发任务管理系统已启动: http://localhost:${PORT}`);
        console.log(`📁 数据持久化: GitHub Gist + 本地备份`);
    });
});
