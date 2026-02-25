const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8086;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

// 确保 data 目录存在
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) {
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
        },
        {
            id: '2',
            name: 'TenantCenter 数据库备注',
            status: 'done',
            branch: 'feature/2026/02/24/添加数据库备注',
            project: 'UFX.SCM.Cloud.TenantCenter',
            description: '给没有备注的字段添加数据库备注',
            createdAt: '2026-02-24',
            reports: [
                { agent: 'main', time: '2026-02-24', content: 'Boss 分配任务：给 TenantCenter 项目添加数据库备注。' },
                { agent: 'backdev', time: '2026-02-24', content: 'TenantCenter 项目已完成数据库备注添加。修改了 TenantCenterDBContext.cs 文件。编译通过，0 错误。' }
            ],
            timeline: [
                { time: '2026-02-24', action: '任务创建' },
                { time: '2026-02-24', action: 'backdev 开发完成' },
                { time: '2026-02-24', action: '编译通过 0错误' }
            ]
        },
        {
            id: '3',
            name: 'AM 数据库备注',
            status: 'done',
            branch: 'feature/2026/02/24/添加数据库备注',
            project: 'UFX.SCM.Cloud.AM',
            description: '审查发现已完整，无需修改',
            createdAt: '2026-02-24',
            reports: [
                { agent: 'main', time: '2026-02-24', content: 'Boss 分配任务：给 AM 项目添加数据库备注。' },
                { agent: 'backdev', time: '2026-02-24', content: '审查完成！检查了 AM 项目的 10 个配置文件，所有字段已有完整备注（71处 HasComment），无需修改。' }
            ],
            timeline: [
                { time: '2026-02-24', action: '任务创建' },
                { time: '2026-02-24', action: 'backdev 审查完成' }
            ]
        },
        {
            id: '4',
            name: 'MiddlegroundFoundationCenter 数据库备注',
            status: 'done',
            branch: 'feature/2026/02/24/添加数据库备注',
            project: 'UFX.SCM.Cloud.MiddlegroundFoundationCenter',
            description: 'OpenCode 处理失败，无修改',
            createdAt: '2026-02-24',
            reports: [
                { agent: 'main', time: '2026-02-24', content: 'Boss 分配任务：给 MiddlegroundFoundationCenter 项目添加数据库备注。' },
                { agent: 'backdev', time: '2026-02-24', content: 'OpenCode 执行超时，没有生成修改。任务状态：失败。' }
            ],
            timeline: [
                { time: '2026-02-24', action: '任务创建' },
                { time: '2026-02-24', action: 'OpenCode 超时失败' }
            ]
        },
        {
            id: '5',
            name: '开发任务管理系统',
            status: 'done',
            branch: 'feature/2026/02/24/开发任务管理系统',
            project: 'task-management',
            description: '看板视图、任务详情、时间线，支持记录所有 Agent 汇报内容',
            createdAt: '2026-02-24',
            reports: [
                { agent: 'main', time: '2026-02-24', content: 'Boss 分配任务：开发任务管理系统，记录所有开发任务，有看板视图，点击可查看详情。' },
                { agent: 'productmanager', time: '2026-02-24', content: '需求文档已完成！包含：7种状态流转、看板视图+拖拽、任务详情页+时间线、预估开发周期：8天。输出：task-management-requirements.md' },
                { agent: 'architect', time: '2026-02-24', content: '架构设计已完成！方案：前后端分离SPA，技术栈 React + TypeScript + Node.js + MySQL，核心模块5个，周期8天。输出：task-management-architecture.md' },
                { agent: 'backdev', time: '2026-02-24', content: '手动开发完成！创建了 index.html，包含看板视图、任务详情弹窗、时间线记录、数据存储在 localStorage。' }
            ],
            timeline: [
                { time: '2026-02-24', action: '任务创建' },
                { time: '2026-02-24', action: 'productmanager 需求分析' },
                { time: '2026-02-24', action: 'architect 架构设计' },
                { time: '2026-02-24', action: 'backdev 开发完成' }
            ]
        },
        {
            id: '6',
            name: '用户禁用自动转办审批任务',
            status: 'done',
            branch: 'feature/2026/02/25/auto-transfer-approval',
            project: 'UFX.SCM.Cloud.WorkflowCenter',
            description: '当用户被禁用时，自动将其审批任务转办给上级；无上级则转办给租户主账号',
            createdAt: '2026-02-25',
            reports: [
                { agent: 'main', time: '2026-02-25', content: 'Boss 分配任务：给 WorkflowCenter 项目增加用户禁用时自动转办审批任务功能。' },
                { agent: 'productmanager', time: '2026-02-25', content: '需求文档已完成！' },
                { agent: 'architect', time: '2026-02-25', content: '架构设计已完成！' },
                { agent: 'backdev', time: '2026-02-25', content: '功能开发完成！新增 UserDisabledEvent、UserDisabledEventHandler、UserDisabledTaskTransferService、UserDisabledTaskTransfer 实体。修复审查问题：拼写错误Respositiy、添加幂等性检查、使用IClock。' },
                { agent: 'reviewer', time: '2026-02-25', content: '代码审查完成，修复问题后通过。' },
                { agent: 'tester', time: '2026-02-25', content: '测试项目配置已修复，添加测试用例。' }
            ],
            timeline: [
                { time: '2026-02-25', action: '任务创建' },
                { time: '2026-02-25', action: 'productmanager 需求分析' },
                { time: '2026-02-25', action: 'architect 架构设计' },
                { time: '2026-02-25', action: 'backdev 开发完成' },
                { time: '2026-02-25', action: 'reviewer 代码审查通过' },
                { time: '2026-02-25', action: 'tester 测试完成' }
            ]
        }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
}

const server = http.createServer((req, res) => {
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
            const rawData = fs.readFileSync(DATA_FILE);
            const data = JSON.parse(rawData.toString('utf8'));
            const jsonStr = JSON.stringify(data);
            res.writeHead(200, { 
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(jsonStr);
        } catch (e) {
            res.writeHead(200, { 
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            });
            res.end('[]');
        }
        return;
    }

    // GitHub 自动同步
    const { exec } = require('child_process');
    
    function syncToGitHub(message = 'Update') {
        console.log('🔄 正在同步到 GitHub...');
        exec('git add . && git commit -m "' + message + '" && git push origin master gh-pages', 
            { cwd: __dirname },
            (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ GitHub 同步失败:', stderr);
                } else {
                    console.log('✅ 已同步到 GitHub!');
                }
            });
    }

    // 保存任务后同步
    function saveTasksAndSync(tasks, res) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
        res.writeHead(200, { 
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: true }));
        syncToGitHub('Update tasks');
    }

    // API: 保存任务
    if (req.method === 'POST' && req.url === '/api/tasks') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const tasks = JSON.parse(body);
                saveTasksAndSync(tasks, res);
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

server.listen(PORT, () => {
    console.log(`🚀 开发任务管理系统已启动: http://localhost:${PORT}`);
    console.log(`📁 数据文件: ${DATA_FILE}`);
});
