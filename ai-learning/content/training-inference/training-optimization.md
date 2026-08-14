---
slug: training-optimization
title: 训练如何让模型从误差中学习
module: training-inference
order: 3
summary: 从损失函数、梯度与验证集理解训练不是简单记忆数据。
tags: ["训练", "损失函数", "梯度下降", "验证集"]
updatedAt: 2026-08-15
prerequisites: ["ai-what-is-model", "data-task-capability"]
sources: [{"id":"adam-optimizer","slug":"training-optimization","title":"Adam: A Method for Stochastic Optimization","module":"training-inference","excerpt":"Adam 通过一阶与二阶矩的自适应估计调整参数更新步长。","url":"https://arxiv.org/abs/1412.6980","kind":"paper","locator":"Abstract"}]
---

## 损失函数是训练时的反馈尺子

训练的核心循环很短：模型先预测，损失函数衡量预测与目标的差距，优化器再调整参数以减小这份差距。损失不是“真实世界的好坏”，而是团队选择的一种可计算代理。因此选择损失函数时，要问它是否会奖励真正想要的行为。

分类任务常用交叉熵，数值预测常用平方误差，但业务目标可能还包含时延、公平性或人工复核成本。这些目标未必都能塞进一个损失函数，往往需要在评估和上线规则中补足。

## 梯度与小批量

参数很多时，不能逐个试验所有改动。梯度给出在当前位置让损失下降最快的局部方向；小批量数据让每一步计算可承受，同时带来一定随机性。学习率过大可能越过较好的区域，过小则训练缓慢。优化器会用不同策略平衡这些问题。

训练曲线只说明优化过程是否稳定，不能单独证明模型可用。持续下降的训练损失也可能意味着模型逐渐记住训练样本。

## 验证集负责及时叫停

把一部分未参与参数更新的数据保留为验证集，可以观察模型是否能迁移到相近但未见过的样本。当训练指标持续改善、验证指标反而变差时，常见原因是过拟合。此时可以减少训练轮数、调整数据、加强正则化，或重新检查任务定义。

测试集应该留到选择方案之后再使用，否则它也会被反复调参“看熟”。

## 原始来源

- [Adam: A Method for Stochastic Optimization](https://arxiv.org/abs/1412.6980) — 论文介绍了常见的自适应梯度优化方法及其参数更新思路。
