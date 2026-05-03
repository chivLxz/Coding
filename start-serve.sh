#!/bin/bash
# 启动 serve 的守护脚本，用于后台运行静态网站服务
cd /Users/chiv/Projects/ai-news-daily
export PATH="/Users/chiv/.nvm/versions/node/v24.13.1/bin:/usr/local/bin:/usr/bin:/bin"
export HOME="/Users/chiv"
exec npx serve out -p 3000
