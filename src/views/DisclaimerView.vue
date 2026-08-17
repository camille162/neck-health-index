<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="px-4 pt-4 pb-8">
    <button class="text-sm text-gray-500 flex items-center gap-1 mb-3" @click="router.back()">
      ← 返回
    </button>
    <h1 class="text-lg font-medium text-gray-900 mb-5">免责声明</h1>

    <div class="space-y-4 text-sm text-gray-700 leading-relaxed">
      <section>
        <h2 class="font-medium text-gray-900 mb-1.5">1. 非医疗性质</h2>
        <p>
          本应用仅为公开健康信息的聚合展示工具，不构成医疗建议。
          本应用不提供疾病诊断、分型、治疗或个性化康复指导。
          所有训练内容请在专业医师或康复治疗师指导下进行。
        </p>
      </section>

      <section>
        <h2 class="font-medium text-gray-900 mb-1.5">2. 内容来源</h2>
        <p>
          本应用收录的所有内容均来自第三方公开资源，原始来源保留所有权利。
          本应用不对原始内容进行修改或剪辑，仅提供链接跳转。
          内容的准确性和完整性由原始来源方负责。
        </p>
      </section>

      <section>
        <h2 class="font-medium text-gray-900 mb-1.5">3. 内容审核的局限性</h2>
        <p>
          本应用对收录内容按照收录标准进行检查，但检查仅涵盖来源资质和动作安全性描述，
          不构成对训练效果或适宜性的保证。审核不等于背书。
          原始内容可能在收录后被修改或删除，本应用不保证链接的持续有效性。
        </p>
      </section>

      <section>
        <h2 class="font-medium text-gray-900 mb-1.5">4. 计时器工具</h2>
        <p>
          本应用提供的计时器仅为通用计时工具，不指导任何具体动作，不预设训练方案。
          用户应自行确认训练内容的适宜性。训练中或训练后如出现疼痛、麻木、头晕等不适，
          请立即停止并就医。
        </p>
      </section>

      <section>
        <h2 class="font-medium text-gray-900 mb-1.5">5. 责任限制</h2>
        <p>
          本应用开发者不对任何人因使用本应用或依赖本应用展示的信息而导致的
          任何损伤、损害或不良健康后果承担责任。用户使用本应用即表示
          已阅读并理解本免责声明。
        </p>
      </section>

      <section>
        <h2 class="font-medium text-gray-900 mb-1.5">6. 红旗症状</h2>
        <p class="mb-2">
          如果你有以下任何一种情况，请立即就医，不要自行训练：
        </p>
        <ul class="space-y-1 text-gray-600 pl-2">
          <li>• 走路时有踩棉花感</li>
          <li>• 手部精细动作变差</li>
          <li>• 大小便功能异常</li>
          <li>• 持续夜间颈部疼痛</li>
          <li>• 外伤后出现的颈部疼痛</li>
          <li>• 不明原因体重下降</li>
          <li>• 伴有发热</li>
          <li>• 上肢进行性无力或肌肉萎缩</li>
          <li>• 颈部活动诱发眩晕、黑矇、跌倒</li>
          <li>• 已确诊类风湿关节炎、强直性脊柱炎累及颈椎</li>
          <li>• 长期使用激素或明显骨质疏松</li>
        </ul>
      </section>
    </div>
  </div>
</template>
