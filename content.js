function injectScript(file) {
	const s = document.createElement('script')
	s.src = chrome.runtime.getURL(file)
	s.onload = () => s.remove()
	;(document.head || document.documentElement).appendChild(s)
}

injectScript('inject.js')
console.log('[MCP Bridge] scripts injected')

injectScript('visual.js')
console.log('[MCP Bridge] visual injected')
