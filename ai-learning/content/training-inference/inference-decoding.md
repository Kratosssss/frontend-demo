---
slug: inference-decoding
title: 推理与解码：训练后的模型怎样生成结果
contentType: note
module: training-inference
order: 4
summary: 区分训练阶段与推理阶段，并理解生成模型的采样控制。
tags: ["推理", "解码", "采样", "温度"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["training-optimization"]
related: ["model-inference-budget"]
sources: [{"id":"hugging-face-generation","slug":"inference-decoding","title":"Generation strategies","module":"training-inference","excerpt":"官方文档比较了贪心、束搜索与采样等文本生成策略的行为差异。","url":"https://huggingface.co/docs/transformers/main/en/generation_strategies","kind":"official-doc","locator":"Generation strategies"}]
evidence: []
---

## 推理不是继续训练

训练阶段会读取样本、计算损失并更新参数；推理阶段则固定参数，根据新输入输出预测。两者对资源的要求不同：训练关注吞吐和反向传播，推理更关注延迟、并发、上下文长度与输出控制。把训练脚本直接当成服务接口，通常会造成不可接受的成本和不稳定性。

对于生成模型，推理往往是逐步生成：模型为下一个 token 给出概率，再由解码策略选择一个 token 并追加到上下文。

## 常见解码策略

贪心解码每次选择概率最高的 token，结果稳定但可能重复。束搜索同时保留多个候选序列，适合一些需要更确定输出的任务，但会增加计算。采样会从概率分布中取样，温度、top-k 和 top-p 等参数决定随机性的范围。

这些参数不是“创意开关”。温度过高会扩大低概率选项，可能增加偏题；过低又可能让输出僵硬。应在固定任务集上比较策略，而不是只看一两个好看的示例。

## 服务层的保护措施

真实服务还需要设置最大输出长度、超时、停止条件和重试策略。输出被截断时，应向调用方明确说明；遇到网络失败，也不能把半段文本伪装成完整答案。对知识问答而言，解码控制还必须服从证据边界：没有可映射来源时不能补充常识。

## 示例

对同一摘要任务比较保守解码和多样采样，并记录可接受差异。

## 常见误区

只调温度，却没有把输出格式和失败重试纳入测试。

## 决策清单

- 先定义任务允许的随机性。
- 在成本与延迟预算内比较策略。

## 原始来源

- [Generation strategies](https://huggingface.co/docs/transformers/main/en/generation_strategies) — Hugging Face 官方文档说明了不同文本生成解码策略及其适用取舍。
