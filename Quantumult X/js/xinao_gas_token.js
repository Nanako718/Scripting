/*
  新澳燃气 Token 抓取
  功能：从任意 ecej.com 请求头中抓取 Token，存入持久化存储
  触发：打开新澳燃气小程序时自动获取
*/

(function () {
  try {
    if (typeof $request === "undefined" || !$request.headers) {
      console.log("[新澳燃气] 未检测到请求信息");
      return $done({});
    }

    const token = $request.headers["token"] || $request.headers["Token"] || "";
    if (!token) {
      console.log("[新澳燃气] 请求头中未包含 token");
      return $done({});
    }

    console.log("[新澳燃气] 捕获到 token:", token);

    // 写入存储（全平台兼容）
    function write(key, value) {
      try { if ($prefs?.setValueForKey) $prefs.setValueForKey(value, key); } catch (_) {}
      try { if ($persistentStore?.write) $persistentStore.write(value, key); } catch (_) {}
      try { if ($store?.put) $store.put(value, key); } catch (_) {}
      try { if ($task?.write) $task.write(value, key); } catch (_) {}
    }

    // 读取存储
    function read(key) {
      try { if ($prefs?.valueForKey) return $prefs.valueForKey(key); } catch (_) {}
      try { if ($persistentStore?.read) return $persistentStore.read(key); } catch (_) {}
      try { if ($store?.get) return $store.get(key); } catch (_) {}
      try { if ($task?.read) return $task.read(key); } catch (_) {}
      return null;
    }

    // 通知
    function notify(title, subtitle, body) {
      try { if ($notification?.post) $notification.post(title, subtitle, body); } catch (_) {}
      try { if ($notify) $notify(title, subtitle, body); } catch (_) {}
    }

    // 检查是否有变化
    let oldToken = read("xinao_gas.token");
    if (oldToken === token) {
      console.log("[新澳燃气] Token 未变化，跳过更新");
      return $done({});
    }

    write("xinao_gas.token", token);

    notify("新澳燃气 Token 已更新", "Token 已自动抓取", token);

    console.log("[新澳燃气] Token 已写入 xinao_gas.token");

  } catch (e) {
    console.log("[新澳燃气] 脚本错误:", e);
  } finally {
    $done({});
  }
})();
