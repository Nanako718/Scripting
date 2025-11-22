(function () {
  try {
    if (typeof $request === "undefined" || !$request.headers) {
      console.log("[10010.cookie] 未检测到请求信息");
      return $done({});
    }

    const cookie = $request.headers["Cookie"] || $request.headers["cookie"] || "";
    if (!cookie) {
      console.log("[10010.cookie] 请求中未包含 Cookie");
      return $done({});
    }

    console.log("[10010.cookie] 捕获到 Cookie:", cookie);

    // 写入 cookie (全平台兼容)
    function write(key, value) {
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

    write("10010.cookie", cookie);
    console.log("[10010.cookie] 已写入 10010.cookie");
    notify("10010 Cookie 更新", "Cookie 已成功保存", "已写入持久化存储");

  } catch (e) {
    console.log("[10010.cookie] 脚本错误:", e);
  } finally {
    $done({});
  }
})();