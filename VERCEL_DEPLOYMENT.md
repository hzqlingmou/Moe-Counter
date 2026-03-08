# Vercel 部署指南

## 重要说明

本项目**可以**在 Vercel 上部署，但需要以下前置条件：

1. **必须使用 MongoDB Atlas**（或其他云数据库），不能使用本地 MongoDB
2. **配置正确的环境变量**

## 部署步骤

### 1. 创建 MongoDB Atlas 集群

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 并注册账号
2. 创建一个免费的 M0 集群
3. 在 **Database Access** 中创建一个数据库用户，记住用户名和密码
4. 在 **Network Access** 中添加 IP 地址：
   - 点击 "Add IP Address"
   - 选择 **"Allow Access from Anywhere"** (0.0.0.0/0) ⚠️ **必须设置，否则 Vercel 无法连接**
5. 获取连接字符串，格式如下：
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

### 2. 部署到 Vercel

#### 方法一：使用 Vercel CLI（推荐）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署（首次部署）
vercel

# 部署到生产环境
vercel --prod
```

#### 方法二：使用 GitHub 集成

1. 将代码推送到 GitHub
2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "Add New Project"
4. 导入你的 GitHub 仓库
5. 配置环境变量（见下文）
6. 点击 "Deploy"

### 3. 配置环境变量

⚠️ **必须配置以下环境变量**：

#### 必需的环境变量

- `DB_URL`: MongoDB 连接字符串
  ```
  mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
  ```

#### 可选的环境变量

- `APP_PORT`: 端口号（默认 3000，Vercel 中会被忽略）
- `APP_SITE`: 你的网站地址（例如：`https://your-project.vercel.app`）
- `GA_ID`: Google Analytics ID
- `LOG_LEVEL`: 日志级别（`debug`, `info`, `warn`, `error`）
- `DB_INTERVAL`: 数据库写入延迟（秒），Vercel 建议设置为 0 或不设置

在 Vercel Dashboard 中配置：
1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加上述变量
4. 重新部署使环境变量生效

### 4. 验证部署

部署完成后，访问 Vercel 提供的域名测试：

- 主页：`https://your-project.vercel.app/`
- 计数器：`https://your-project.vercel.app/@your-counter-name`
- 健康检查：`https://your-project.vercel.app/heart-beat`
- JSON 记录：`https://your-project.vercel.app/record/@your-counter-name`

## 技术说明

### 为什么可以部署到 Vercel？

1. **Express 应用**：Vercel 支持 Express 应用作为 Serverless Functions
2. **数据库连接**：使用 `mongoose.connect()` 在模块加载时自动连接
3. **连接池**：配置了 `maxPoolSize: 10` 以适应 Serverless 环境

### 代码特点

- ✅ 模块加载时自动连接数据库
- ✅ 使用连接池优化性能
- ✅ 支持延迟写入（可选）
- ✅ 缓存计数器在内存中

## 注意事项

### ⚠️ 冷启动问题
- Serverless 函数在闲置 5 分钟后会进入冷启动
- 首次请求可能需要 2-5 秒建立数据库连接
- 建议：设置定期访问或使用付费计划减少冷启动

### ⚠️ 数据库白名单
- **必须**在 MongoDB Atlas 中设置 "Allow Access from Anywhere" (0.0.0.0/0)
- Vercel 的 IP 地址是动态的，无法添加特定 IP

### ⚠️ 执行时间限制
- Vercel 免费版：函数最大执行时间 10 秒
- Vercel 专业版：函数最大执行时间 60 秒

### ⚠️ 内存限制
- Vercel 免费版：最大内存 256MB
- 对于本项目已经足够

### ⚠️ 关于 DB_INTERVAL
- 如果设置 `DB_INTERVAL`，在 Vercel 的 Serverless 环境中可能不会按预期工作
- 因为 `setInterval` 在 Serverless 函数执行完毕后会被清除
- 建议：不设置或设置为 0，每次请求都写入数据库

## 故障排查

### 数据库连接失败

**错误信息**：`连接 mongo 数据库失败`

**解决方法**：
1. 检查 `DB_URL` 环境变量是否正确
2. 检查 MongoDB Atlas 的 Network Access 是否设置为 0.0.0.0/0
3. 检查数据库用户名和密码是否正确
4. 检查数据库名称是否存在

### 部署失败

**错误信息**：`Build failed`

**解决方法**：
1. 检查 `vercel.json` 配置是否正确
2. 检查所有依赖是否已安装在 `package.json` 中
3. 查看 Vercel 的部署日志获取详细错误信息

### 404 错误

**解决方法**：
1. 检查 `vercel.json` 中的 `rewrites` 配置
2. 确保 `api/index.js` 文件存在
3. 检查静态资源路径是否正确

## 环境变量示例

```bash
# MongoDB 连接字符串（必需）
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/moe-counter?retryWrites=true&w=majority

# 网站地址（可选）
APP_SITE=https://moe-counter.vercel.app

# Google Analytics（可选）
GA_ID=G-XXXXXXXXXX

# 日志级别（可选）
LOG_LEVEL=info

# 数据库写入延迟，Vercel 建议不设置或设置为 0（可选）
DB_INTERVAL=0
```

## 参考链接

- [Vercel 文档 - Node.js Serverless Functions](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [MongoDB Atlas 文档](https://www.mongodb.com/docs/atlas/)
- [Mongoose 文档](https://mongoosejs.com/docs/)
- [Vercel 环境变量配置](https://vercel.com/docs/concepts/projects/environment-variables)

## 常见问题

### Q: 可以在 Vercel 上使用本地 MongoDB 吗？
**A**: 不可以。Vercel 无法访问你的本地网络，必须使用云数据库如 MongoDB Atlas。

### Q: 为什么我的计数器不更新？
**A**: 检查以下几点：
1. 数据库连接是否成功
2. `DB_URL` 环境变量是否正确
3. 查看 Vercel 的函数日志

### Q: 冷启动会影响计数器性能吗？
**A**: 会。首次访问时会有 2-5 秒的延迟，后续访问会很快。这是 Serverless 架构的正常现象。
