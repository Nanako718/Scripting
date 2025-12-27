/*
  10099_config.js
  功能：自动抓取中国广电 App 的 access、data 和 Cookie，并保存为统一 key：10099.access、10099.data、10099.cookie
  URL: https://app.10099.com.cn/contact-web/api/busi/qryUserInfo
*/

(function () {
  try {
    if (typeof $request === "undefined" || !$request.headers) {
      console.log("[10099.config] 未检测到请求信息");
      return $done({});
    }

    const headers = $request.headers;
    const access = headers["access"] || headers["Access"] || "";
    const data = headers["t5hhv8ah"] || headers["T5hhv8ah"] || "";
    const cookie = headers["Cookie"] || headers["cookie"] || "";

    if (!access && !data && !cookie) {
      console.log("[10099.config] 请求中未包含所需信息");
      return $done({});
    }

    // 写入配置 (全平台兼容)
    function write(key, value) {
      if (!value) return;
      try { if ($prefs?.setValueForKey) $prefs.setValueForKey(value, key); } catch (_) {}
      try { if ($persistentStore?.write) $persistentStore.write(value, key); } catch (_) {}
      try { if ($store?.put) $store.put(value, key); } catch (_) {}
      try { if ($task?.write) $task.write(value, key); } catch (_) {}
    }

    // 通知 (兼容 QX / Loon / Surge)
    function notify(title, subtitle, body) {
      try { if ($notification?.post) $notification.post(title, subtitle, body); } catch (_) {}
      try { if ($notify) $notify(title, subtitle, body); } catch (_) {}
    }

    let savedCount = 0;
    if (access) {
      write("10099.access", access);
      console.log("[10099.config] 已写入 10099.access");
      savedCount++;
    }
    if (data) {
      write("10099.data", data);
      console.log("[10099.config] 已写入 10099.data");
      savedCount++;
    }
    if (cookie) {
      write("10099.cookie", cookie);
      console.log("[10099.config] 已写入 10099.cookie");
      savedCount++;
    }

    if (savedCount > 0) {
      notify("10099 配置更新", `已成功保存 ${savedCount} 项配置`, "已写入持久化存储");
    }

  } catch (e) {
    console.log("[10099.config] 脚本错误:", e);
  } finally {
    $done({});
  }
})();

