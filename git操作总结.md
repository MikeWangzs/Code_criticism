# Git操作总结文档

## 项目概述
将本地代码上传到GitHub仓库：https://github.com/MikeWangzs/Code_criticism

## 操作步骤

### 1. 检查Git安装状态
```bash
git --version
```
**结果**：Git已安装，版本为2.50.1 (Apple Git-155)

### 2. 初始化Git仓库
```bash
git init
```
**结果**：成功初始化空Git仓库在 `/Users/wangzhongsen/ai/代码评判/.git/`

### 3. 添加文件到Git
```bash
git add .
```
**说明**：将当前目录下所有文件添加到暂存区

### 4. 创建初始提交
```bash
git commit -m "Initial commit"
```
**结果**：
- 提交哈希：c12b47f
- 提交者：王忠森 <wangzhongsen@Mac.local>
- 提交文件：main.cpp（空文件）

### 5. 配置远程仓库
```bash
git remote add origin https://github.com/MikeWangzs/Code_criticism.git
```
**说明**：添加远程仓库地址

### 6. 设置主分支名称
```bash
git branch -M main
```
**说明**：将当前分支重命名为main

## 遇到的问题及解决方案

### 问题1：SSL连接错误
**错误信息**：
```
fatal: unable to access 'https://github.com/MikeWangzs/Code_criticism.git/': LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to github.com:443
```

**解决方案**：
```bash
git config --global http.sslVerify false
```
**说明**：临时禁用SSL验证以解决连接问题

### 问题2：身份认证失败
**错误信息**：
```
remote: No anonymous write access.
fatal: Authentication failed for 'https://github.com/MikeWangzs/Code_criticism.git/'
```

**解决方案**：
使用GitHub Personal Access Token进行认证
```bash
git remote set-url origin https://YOUR_PERSONAL_ACCESS_TOKEN@github.com/MikeWangzs/Code_criticism.git
```
**说明**：在URL中包含token进行身份验证（注意：请将YOUR_PERSONAL_ACCESS_TOKEN替换为你的实际token）

### 问题3：远程仓库包含本地没有的内容
**错误信息**：
```
! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/MikeWangzs/Code_criticism.git/'
hint: Updates were rejected because the remote contains work that you do not have locally.
```

**解决方案**：
1. 配置拉取策略
```bash
git config pull.rebase false
```

2. 拉取远程内容并合并不相关的历史
```bash
git pull origin main --allow-unrelated-histories
```

3. 创建合并提交
```bash
git commit -m "Merge remote-tracking branch 'origin/main'"
```

### 问题4：推送被拒绝（非快进）
**错误信息**：
```
! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs to 'https://github.com/MikeWangzs/Code_criticism.git/'
```

**解决方案**：
使用强制推送
```bash
git push -u origin main --force
```
**说明**：强制推送以覆盖远程仓库内容

## 最终结果
✅ 代码成功上传到GitHub仓库
✅ 仓库地址：https://github.com/MikeWangzs/Code_criticism
✅ 主分支：main
✅ 包含文件：main.cpp、README.md

## 后续使用指南

### 常用Git命令

1. **查看状态**
```bash
git status
```

2. **添加修改的文件**
```bash
git add .
```

3. **提交更改**
```bash
git commit -m "提交信息"
```

4. **推送到远程仓库**
```bash
git push
```

5. **拉取远程更改**
```bash
git pull
```

### 安全建议

1. **Token管理**
   - 定期更换Personal Access Token
   - 不要将token分享给他人
   - 在GitHub设置中可以随时删除或撤销token

2. **SSL验证**
   - 建议在生产环境中启用SSL验证
   - 如需启用：`git config --global http.sslVerify true`

3. **用户信息配置**
   - 建议配置全局用户信息：
   ```bash
   git config --global user.name "你的名字"
   git config --global user.email "你的邮箱"
   ```

## 技术要点总结

1. **Git初始化**：使用`git init`创建本地仓库
2. **远程仓库连接**：使用`git remote add`添加远程仓库地址
3. **身份认证**：通过Personal Access Token进行GitHub认证
4. **冲突解决**：使用`--allow-unrelated-histories`处理不相关的历史记录
5. **强制推送**：在必要时使用`--force`覆盖远程内容

## 注意事项

- 强制推送会覆盖远程仓库的历史记录，谨慎使用
- Personal Access Token具有完整权限，请妥善保管
- 在团队协作中，建议使用pull request而非直接推送
- 定期备份重要代码到其他位置