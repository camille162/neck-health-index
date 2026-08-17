export const SAFETY_TEXTS = {
  banner: '本应用仅聚合公开科普信息，不构成医疗建议。',

  disclaimer: '本应用仅为公开健康信息的聚合展示工具，不构成医疗建议。所有训练内容请在专业医师或康复治疗师指导下进行。本应用不指导动作，仅提供内容索引与通用计时功能。如训练中或训练后出现不适，请立即停止并就医。',

  redFlagSymptoms: [
    '走路时有踩棉花感',
    '手部精细动作变差（如扣扣子、拿筷子变得笨拙）',
    '大小便功能异常',
    '持续夜间颈部疼痛',
    '外伤后出现的颈部疼痛',
    '不明原因体重下降',
    '伴有发热',
    '上肢进行性无力或肌肉萎缩',
    '颈部活动诱发眩晕、黑矇、跌倒',
    '已确诊类风湿关节炎、强直性脊柱炎累及颈椎',
    '长期使用激素或明显骨质疏松'
  ],

  redFlagIntro: '如果你出现以下任何一种情况，请立即就医，不要自行训练：',

  acutePainWarning: '如果你当前正处于颈部急性疼痛期，请先就医，暂不建议使用本工具。',

  safetyNoticeItems: [
    '本应用仅聚合公开的颈椎健康科普信息，不构成医疗建议。',
    '本应用不提供任何疾病诊断、分型或个性化康复指导。',
    '所有训练内容请在专业医生或康复治疗师确认后练习。',
    '本应用不指导动作，仅提供内容索引与通用计时功能。'
  ],

  actionDemoWarning: '本内容包含动作演示。动作是否适合你，请先咨询医生或康复治疗师。训练中如出现疼痛、麻木、头晕等不适，请立即停止并就医。',

  timerWarning: '请确认你已获得专业指导，本计时器不指导动作。训练中如有不适请立即停止。',

  reminderMessage: '起身活动一下，改变姿势。',

  totalDurationWarning: '建议单次训练总时长不超过 10-15 分钟，请根据自身情况调整。'
}

export function formatViewCount(count: number): string {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return String(count)
}

export function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, '/')
}
