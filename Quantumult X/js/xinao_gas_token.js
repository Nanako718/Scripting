/*
  新澳燃气 Token 抓取
  功能：自动抓取新澳燃气小程序的 Token，存入持久化存储
  触发：打开新澳燃气小程序时自动获取
*/

(function () {
  try {
    if (typeof $request === "undefined") {
      console.log("[新澳燃气] 未检测到请求信息");
      return $done({});
    }

    // 从响应体提取 token
    let body = $response.body;
    if (!body) {
      console.log("[新澳燃气] 响应体为空");
      return $done({});
    }

    let json;
    try {
      json = JSON.parse(body);
    } catch (e) {
      console.log("[新澳燃气] 响应解析失败:", e);
      return $done({});
    }

    if (json.resultCode !== 200 || !json.data || !json.data.token) {
      console.log("[新澳燃气] 响应中未包含 token:", JSON.stringify(json));
      return $done({});
    }

    let token = json.data.token;
    let mobileNo = json.data.maskedMobileNo || json.data.mobileNo || "";
    let tokenTtl = json.data.tokenTtl || 0;
    let days = Math.floor(tokenTtl / 86400);

    console.log("[新澳燃气] token:", token);
    console.log("[新澳燃气] 手机号:", mobileNo);
    console.log("[新澳燃气] 有效期:", days, "天");

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

    // 保存 token
    write("xinao_gas.token", token);
    write("xinao_gas.mobile", mobileNo);
    write("xinao_gas.ttl", String(tokenTtl));

    notify(
      "新澳燃气 Token 已更新",
      `${mobileNo} | 有效期 ${days} 天`,
      token
    );

    console.log("[新澳燃气] Token 已写入 xinao_gas.token");

  } catch (e) {
    console.log("[新澳燃气] 脚本错误:", e);
  } finally {
    $done({});
  }
})();
