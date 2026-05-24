;(() => {
	if (window.__mcp_injected) return
	window.__mcp_injected = true

	console.log('[MCP inject] ✓ ACTIVE')

	const PROMPT_PREFIX = `[SYSTEM INSTRUCTIONS - MCP Tools Available]
You have access to tools running on the user's local computer via MCP Bridge.
To call a tool, output a block EXACTLY in this format on its own lines:

<tool_call>
command here
</tool_call>

After outputting a tool call:
- STOP
- Wait for the result

The result will appear as:

<tool_result>
command output here
</tool_result>

Rules:
- Use absolute paths
- One command at a time
- After finishing — summarize results

[END SYSTEM INSTRUCTIONS]
`

	// =========================
	// FETCH PATCH
	// =========================

	const originalFetch = window.fetch

	window.fetch = async function (...args) {
		let [resource, config] = args

		const url = typeof resource === 'string' ? resource : resource?.url || ''

		console.log('[MCP inject] FETCH:', url)

		// block noisy telemetry
		if (url.includes('hif-dliq.deepseek.com') || url.includes('hif-leim.deepseek.com')) {
			console.log('[MCP inject] blocked telemetry:', url)

			return new Response('{}', {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
				},
			})
		}

		if (url.includes('/api/v0/chat/completion') && config?.body) {
			try {
				const body = JSON.parse(config.body)

				if (body && typeof body.prompt === 'string' && !body.prompt.includes('[SYSTEM INSTRUCTIONS - MCP')) {
					body.prompt = PROMPT_PREFIX + body.prompt

					config.body = JSON.stringify(body)

					console.log('[MCP inject] ✓ MCP injected')
				}
			} catch (e) {
				console.error('[MCP inject] fetch patch error', e)
			}
		}

		return originalFetch.apply(this, [resource, config])
	}

	// =========================
	// XHR PATCH
	// =========================

	const originalOpen = XMLHttpRequest.prototype.open
	const originalSend = XMLHttpRequest.prototype.send

	XMLHttpRequest.prototype.open = function (method, url, ...rest) {
		this._mcp_url = url
		this._mcp_method = method

		console.log('[MCP inject] XHR:', method, url)

		return originalOpen.call(this, method, url, ...rest)
	}

	XMLHttpRequest.prototype.send = function (body) {
		try {
			const url = this._mcp_url || ''

			// =========================
			// BLOCK TELEMETRY
			// =========================

			if (url.includes('hif-dliq.deepseek.com') || url.includes('hif-leim.deepseek.com')) {
				console.log('[MCP inject] blocked XHR telemetry:', url)

				setTimeout(() => {
					this.readyState = 4
					this.status = 200
					this.responseText = '{}'

					this.onreadystatechange?.()
					this.onload?.()
				}, 0)

				return
			}

			// =========================
			// PATCH CHAT REQUEST
			// =========================

			if (url.includes('/api/v0/chat/completion') && typeof body === 'string') {
				const data = JSON.parse(body)

				if (data && typeof data.prompt === 'string' && !data.prompt.includes('[SYSTEM INSTRUCTIONS - MCP')) {
					data.prompt = PROMPT_PREFIX + data.prompt

					body = JSON.stringify(data)

					console.log('[MCP inject] ✓ MCP injected')
				}
			}

			// =========================
			// STREAM LOGGER
			// =========================

			this.addEventListener('progress', () => {
				try {
					const text = this.responseText || ''

					const chunks = text.split('\n')

					for (const chunk of chunks) {
						if (chunk.startsWith('data: ')) {
							const raw = chunk.slice(6)

							console.log('[MCP inject] STREAM', raw)

							try {
								const parsed = JSON.parse(raw)

								if (parsed.v) {
									console.log('[MCP inject] TOKEN:', JSON.stringify(parsed.v))
								}
							} catch {}
						}
					}
				} catch {}
			})
		} catch (e) {
			console.error('[MCP inject] XHR patch error', e)
		}

		return originalSend.call(this, body)
	}
})()
