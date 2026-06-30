// sw.js — Apron Business Service Worker
// Push bildirimleri için arka planda çalışır.
// GitHub Pages'te index.html ile aynı klasörde olmalı.

const CACHE_NAME = "apron-v1";

// Kurulum
self.addEventListener("install", e => {
  self.skipWaiting();
});

// Aktivasyon
self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});

// Push bildirimi gelince göster
self.addEventListener("push", e => {
  let data = { title: "Apron Business", body: "Hatırlatma var.", tag: "apron-hat" };
  try { data = { ...data, ...e.data.json() }; } catch(err) {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: data.tag,
      icon: "https://apronkuafor-create.github.io/apron-app/icon-192.png",
      badge: "https://apronkuafor-create.github.io/apron-app/icon-192.png",
      requireInteraction: true,   // Kullanıcı kapatana kadar durur
      data: { url: self.location.origin + "/apron-app/" }
    })
  );
});

// Bildirime tıklanınca uygulamayı aç/öne getir
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      const hedef = e.notification.data?.url || "/apron-app/";
      for (const c of list) {
        if (c.url.includes("/apron-app/") && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(hedef);
    })
  );
});

// Alarm: her gün sabah uygulamanın kendisi tetikler (aşağıda), SW sadece gösterir.
// Uygulama kapalıysa Push API üzerinden bildirim gelir (Supabase Edge Function gönderir).
self.addEventListener("message", e => {
  if (e.data?.tip === "yerelBildirim") {
    const { baslik, govde, etiket } = e.data;
    self.registration.showNotification(baslik || "Apron Business", {
      body: govde || "",
      tag: etiket || "apron-hat",
      icon: "https://apronkuafor-create.github.io/apron-app/icon-192.png",
      requireInteraction: true,
      data: { url: self.location.origin + "/apron-app/" }
    });
  }
});
