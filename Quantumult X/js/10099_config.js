/*
  10099_config.js
  功能：自动抓取中国广电 App 的 access、data、Cookie 和 body，并保存为统一 key：10099.access、10099.data、10099.cookie、10099.body
  匹配范围：所有 app.10099.com.cn 的请求
*/

(function () {
  try {
    if (typeof $request === "undefined") {
      return $done({});
    }
    
    // 只处理 qryUserInfo 请求，避免拦截其他请求
    const url = $request.url || "";
    if (!url.includes("/api/busi/qryUserInfo")) {
      return $done({});
    }

    const headers = $request.headers || {};
    const access = headers["access"] || headers["Access"] || "";
    const data = headers["t5hhv8ah"] || headers["T5hhv8ah"] || "";
    
    // 处理 Cookie：可能有多个 cookie header（HTTP/2），需要合并
    let cookie = "";
    if (headers["Cookie"]) {
      if (Array.isArray(headers["Cookie"])) {
        cookie = headers["Cookie"].join("; ");
      } else {
        cookie = headers["Cookie"];
      }
    } else if (headers["cookie"]) {
      if (Array.isArray(headers["cookie"])) {
        cookie = headers["cookie"].join("; ");
      } else {
        cookie = headers["cookie"];
      }
    }
    
    // 处理 body（可能为空）
    // 在 Loon 中，body 可能通过 $request.body 或 $request.bodyBytes 获取
    let body = $request.body || "";
    
    // 如果 body 是空的，尝试从 bodyBytes 获取（Loon 可能使用这种方式）
    if (!body && $request.bodyBytes) {
      try {
        if (typeof $request.bodyBytes === 'string') {
          body = $request.bodyBytes;
        } else if ($request.bodyBytes instanceof ArrayBuffer) {
          body = String.fromCharCode.apply(null, new Uint8Array($request.bodyBytes));
        } else if (Array.isArray($request.bodyBytes)) {
          body = String.fromCharCode.apply(null, $request.bodyBytes);
        }
      } catch (e) {
        // 忽略转换错误
      }
    }
    
    // 判断当前是哪个阶段
    const isBodyStage = !!body;

    // 写入配置 (全平台兼容)
    function write(key, value) {
      if (!value) return;
      try { if ($prefs?.setValueForKey) $prefs.setValueForKey(value, key); } catch (_) {}
      try { if ($persistentStore?.write) $persistentStore.write(value, key); } catch (_) {}
      try { if ($store?.put) $store.put(value, key); } catch (_) {}
      try { if ($task?.write) $task.write(value, key); } catch (_) {}
    }

    // Header 阶段：保存 access、data、cookie
    if (!isBodyStage) {
      if (access) write("10099.access", access);
      if (data) write("10099.data", data);
      if (cookie) write("10099.cookie", cookie);
    }
    
    // Body 阶段：保存 body 和 header 信息
    if (isBodyStage) {
      if (body) write("10099.body", body);
      if (access) write("10099.access", access);
      if (data) write("10099.data", data);
      if (cookie) write("10099.cookie", cookie);
    }

  } catch (e) {
    console.log("[10099.config] 脚本错误:", e);
  } finally {
    $done({});
  }
})();

