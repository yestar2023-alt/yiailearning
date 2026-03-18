---
title: 我如何为 24/7 OpenClaw Agent 团队管理记忆（以及为什么一次纠正能修复所有 Agent）
date: 2026-03-15T15:50:33.895Z
tags:
  - AI Agent
  - 记忆管理
  - 教程
  - 翻译
slug: openclaw-agent-memory
draft: false
summary: >-
  原文作者：Shubham Saboo 原文链接：https://x.com/saboo shubham
  /status/2033026472856952849 大多数 AI Agent 在 Session 结束的那一刻就会忘记一切。 我在一台 Mac Mini
  上运行 6 个 A...
excerpt: >-
  原文作者：Shubham Saboo 原文链接：https://x.com/saboo shubham
  /status/2033026472856952849 大多数 AI Agent 在 Session 结束的那一刻就会忘记一切。 我在一台 Mac Mini
  上运行 6 个 A...
---
原文作者：Shubham Saboo
原文链接：https://x.com/saboo_shubham_/status/2033026472856952849

大多数 AI Agent 在 Session 结束的那一刻就会忘记一切。

我在一台 Mac Mini 上运行 6 个 Agent，24/7 不间断。研究、内容、工程、通讯、LinkedIn、协调。它们按 Cron 计划运行。每次 Session 开始时都是全新的，对之前发生的事毫无记忆。

这听起来应该是灾难。但并不是。

因为记忆不在 Agent 里，而在它周围的文件里。

我最近写过我是如何构建这个自主 Agent 团队的。被问得最多的问题是：“你怎么让它们真正记住东西？”

这就是答案。记忆架构、失败经验，以及真正有效的方案。

每个 Agent 框架都在向你推销功能。工具使用。多 Agent 协调。流式传输。花哨的编排模式。

没人谈论第二天会发生什么。

你的 Agent 在第一次 Session 表现出色。输出很棒。你很兴奋。你关闭终端。第二天回来。Agent 完全不知道你是谁，昨天告诉过它什么，或者已经纠正过哪些错误。

你重新解释一切。再来一遍。

这是自主 Agent 的根本问题。每个 Session 都从零开始。你昨天的纠正？没了。你解释过的偏好？没了。除非你让记忆显式化，否则你的 Agent 每次醒来都患有失忆症。

我在第一周就撞到了这堵墙。我告诉 Kelly（我的 X/Twitter Agent）不要用表情符号。她改正了。然后我看到 Rachel 的 LinkedIn 草稿。表情符号。我纠正了 Rachel。第二天，Pam 的通讯草稿来了。表情符号。

6 个 Agent。同样的纠正。6 次单独的对话。每次都是这样。

我花在重复解释上的时间比实际工作还多。我告诉 Kelly 的偏好没有传达给 Rachel。我为 Pam 设定的规则对 Ross 不存在。

OpenClaw 已经处理了前两层。SOUL.md 文件、每日日志、Session 结构。但我需要在上面加第三层，让纠正能自动传播到所有 6 个 Agent。

Agent 记忆不是一件事。它是三层，每层解决不同的问题。

启动时加载的 Markdown 文件。每个 Agent 在做任何事情之前都会读取这些文件。

- SOUL.md 告诉 Agent 它是谁
- USER.md 告诉它我是谁
- MEMORY.md 保存它随时间学到的精选教训
- 每日日志（memory/YYYY-MM-DD.md）保存昨天的原始 Session 笔记
这是让 Agent 感觉有记忆的层。

Kelly 的 MEMORY.md 里有个叫"BAD（我做错的）"的部分，列出了我拒绝过的所有内容模式。表情符号。话题标签。LinkedIn 语气。要点式帖子。这个列表是她自己写的，未经提示，在我纠正之后。它每次 Session 都加载。她再也不会重复那些错误。

Dwight 的记忆里有一条规则改变了一切："如果 Alex（我们的目标人物）今天不能用它做任何事，就跳过它。"他从标记 47 个故事变成只交付 7 个。同样的模型。不同的记忆文件。

实时对话。Cron 作业输出。跨 Agent 消息。单个 Session 内发生的一切。

这一层按设计是短暂的。当 Kelly 在下午 5 点运行时，她读取 Dwight 的情报，起草帖子，在她的每日文件中记录她的产出，然后 Session 结束。对话本身消失。重要的东西被写入文件。不重要的东西就没了。

这不是限制。这是垃圾回收。

记忆多并不总是更好。Kelly 的每日日志曾经达到 161,000 Token，她的输出质量崩溃了。她读取的历史太多，以至于没有空间做实际工作。现在她只加载今天和昨天的。重要的东西反正都住在 MEMORY.md 里。

Google Vertex AI Memory Bank。这是连接所有 6 个 Agent 的层。它通过三个渠道工作：

1. Auto-capture：从每次对话中提取事实并存储
1. File sync：监控 21 个工作区文件，更新时同步
1. Auto-recall：在每次 Agent 轮次前使用相似度搜索检索最相关的 10 条记忆
这是让一次纠正能修复所有 Agent 的层。

我最近开源了一个 OpenClaw 插件，用于 Google Vertex AI Memory Bank。自动捕获、自动回忆、跨 Agent 持久记忆。把这个 Repo 链接发给你的 Agent，看着它自己安装自己。

我告诉 Monica"任何内容中都不要用破折号"。

- 会话记忆：Monica 把它记录在她的每日文件中
- 工作记忆：明天启动时会读取
- 长期记忆：Memory Bank 从我们的对话中捕获这个事实
她把它提炼到她的 MEMORY.md 中。这是永久工作记忆。

现在当任何 Agent 开始 Session 时，这个偏好会自动浮现。Kelly 避免用它。Rachel 也是。Pam 也是。Ross 也是。一次对话。6 个 Agent 更新。我从来不需要说第二遍。

同样的纠正存在于三个地方，服务于三个目的：

- 每日日志：用于近期上下文
- MEMORY.md：用于 Monica 的 Session 启动
- Memory Bank：用于跨 Agent 传播
冗余就是重点。如果一层失败，其他层会接住它。

我不是第一次就设计出这个架构的。让我帮你避免这些失败。

结果：持续崩溃。没存储任何有用的东西。Embedding 不可靠，检索更糟。一周后放弃。

结果：技术上可行。但它索引原始 Session 转录。这意味着 Agent 回忆的是操作噪音，比如"检查 Cron 状态…全部健康"，而不是实际的偏好和决策。

噪音问题是致命杀手。存储一切的记忆系统就是回忆垃圾的记忆系统。

当前系统有效是因为它分离了捕获和回忆。Memory Bank 使用 LLM 从对话中提取事实，而不是原始转录。存储的是实际的偏好、决策和教训。

你不需要在第一天就拥有所有三层。从一个文件开始。

1. 写一个 MEMORY.md​，包含你最重要的 3 个偏好
1. 让你的 Agent 在 Session 启动时加载它
1. 给反馈一周
1. 当你发现自己第二次纠正同样的事情时，把它添加到文件中 仅这一点就能在一周内把你的重复纠正减少一半。
当你撞到我撞到的那堵墙时——你因为同样的事情纠正 6 个 Agent——那就是你需要第三层的时候。我开源了解决这个问题的插件。

从一个文件开始。一次纠正。其余的会随之而来。

原文作者：Shubham Saboo
公众号：AI 创新社
