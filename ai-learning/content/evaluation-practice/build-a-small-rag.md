---
slug: build-a-small-rag
title: 实践：搭建一个可验证的小型 RAG 闭环
module: evaluation-practice
order: 12
summary: 用最小闭环把内容校验、搜索、受限回答和评估连接起来。
tags: ["RAG 实践", "内容校验", "测试", "同步"]
updatedAt: 2026-08-15
prerequisites: ["evaluation-for-ai", "rag-pipeline"]
sources: [{"id":"ragas-evaluation","slug":"build-a-small-rag","title":"RAGAS: Automated Evaluation of Retrieval Augmented Generation","module":"evaluation-practice","excerpt":"论文提出用无需人工参考答案的指标评估检索增强生成链路。","url":"https://arxiv.org/abs/2309.15217","kind":"paper","locator":"Abstract"}]
---

## 先做最小可观察闭环

一个小型 RAG 项目不需要先接入所有云资源。先准备一组原创 Markdown 笔记，校验 frontmatter、来源和前置关系，再生成确定性索引。接着实现本地全文搜索，并为每条结果保留稳定 slug。只要这一步可测试，就已经具备公开阅读与检索的可靠底座。

之后再把内容交给可替换的检索/回答适配层。适配层的输入输出应使用稳定的笔记和来源结构，而不泄露特定供应商的临时字段。

## 把外部写操作留在边界之外

课程中的 RAG 练习可以先从只读资料开始：明确哪些内容是可检索证据，哪些动作会产生外部副作用，并为后者另行设计权限和人工确认。当前项目只交付静态 Markdown、校验和本地搜索索引，不连接任何外部知识库。

## 用失败用例收尾

最后为无匹配问题、损坏 frontmatter、重复 slug、未来前置依赖、未知引用、网络失败和中断流添加测试。特别要断言：没有至少一个可映射引用且完成事件未确认 grounded 时，答案逐字是 `知识库中未找到`。这条规则让系统在不确定时保持诚实。

## 原始来源

- [RAGAS: Automated Evaluation of Retrieval Augmented Generation](https://arxiv.org/abs/2309.15217) — 论文讨论了面向 RAG 链路的自动化评估指标。
