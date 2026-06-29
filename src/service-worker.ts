/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope

import { build, files, version } from '$service-worker'

const CACHE = `wuwa-planner-${version}`
const ASSETS = [...build, ...files]

sw.addEventListener('install', (event) => {
    async function addFilesToCache() {
        const cache = await caches.open(CACHE)
        await cache.addAll(ASSETS)
    }
    event.waitUntil(addFilesToCache())
})

sw.addEventListener('activate', (event) => {
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key)
        }
    }
    event.waitUntil(deleteOldCaches())
})

sw.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return
    async function respond() {
        const url = new URL(event.request.url)
        const cache = await caches.open(CACHE)

        if (ASSETS.includes(url.pathname)) {
            const cached = await cache.match(url.pathname)
            if (cached) return cached
        }

        try {
            const response = await fetch(event.request)
            if (response.ok && url.origin === self.location.origin) {
                cache.put(event.request, response.clone())
            }
            return response
        } catch {
            const cached = await cache.match(url.pathname)
            if (cached) return cached
            return new Response('Offline', { status: 503 })
        }
    }
    event.respondWith(respond())
})
