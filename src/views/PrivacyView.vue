<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="px-4 pt-4 pb-8">
    <button class="text-sm text-gray-500 flex items-center gap-1 mb-3" @click="router.back()">
      ← 返回
    </button>
    <h1 class="text-lg font-medium text-gray-900 mb-5">隐私说明</h1>

    <div class="space-y-4 text-sm text-gray-700 leading-relaxed">
      <section>
        <h2 class="font-medium text-gray-900 mb-1.5">不收集任何用户数据</h2>
        <p>
          本应用不收集、不存储、不上传任何用户个人数据。
          本应用没有服务器、没有数据库、没有用户系统、没有 API。
        </p>
      </section>

      <section>
        <h2 class="font-medium text-gray-900 mb-1.5">本地存储</h2>
        <p>
          以下数据仅存储在你的浏览器本地（localStorage）中，不会离开你的设备：
        </p>
        <ul class="mt-2 space-y-1 text-gray-600 pl-2">
          <li>• 收藏的内容列表</li>
          <li>• 浏览历史记录</li>
          <li>• 计时器使用记录</li>
          <li>• 久坐提醒设置</li>
          <li>• 安全须知确认状态</li>
        </ul>
        <p class="mt-2">
          清除浏览器数据或卸载应用将删除以上所有记录。
        </p>
      </section>

      <section>
        <h2 class="font-medium text-gray-900 mb-1.5">不收集健康数据</h2>
        <p>
          本应用不收集用户的年龄、性别、症状、病史等任何健康评估数据，
          不做用户画像，不做个性化推荐。
        </p>
      </section>

      <section>
        <h2 class="font-medium text-gray-900 mb-1.5">通知权限</h2>
        <p>
          久坐提醒功能需要浏览器通知权限，该权限仅用于在本地弹出提醒通知，
          不会向任何服务器发送信息。你可以随时在浏览器设置中撤销此权限。
        </p>
      </section>

      <section>
        <h2 class="font-medium text-gray-900 mb-1.5">外部链接</h2>
        <p>
          本应用展示的内容链接指向第三方网站。点击链接后，你将离开本应用，
          第三方网站有其独立的隐私政策，本应用不对第三方网站的行为负责。
        </p>
      </section>

      <section>
        <h2 class="font-medium text-gray-900 mb-1.5">开源透明</h2>
        <p>
          本应用为开源项目，所有代码公开可审查。你可以自行验证本应用
          确实不进行任何网络数据上传。
        </p>
      </section>
    </div>
  </div>
</template>
