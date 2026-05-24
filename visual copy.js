function scan() {
	const blocks = document.querySelectorAll('p.ds-markdown-paragraph')

	blocks.forEach((el) => {
		if (el.dataset.toolFixed) return

		if (!el.innerText.includes('<tool_call>')) return

		const div = document.createElement('div')
		div.style.background = 'black'
		div.style.color = 'white'
		div.style.padding = '10px'
		div.style.fontFamily = 'monospace'
		div.style.whiteSpace = 'pre-wrap'

		const match = el.innerText.match(/<tool_call>[\s\S]*<\/tool_call>/)

		if (!match) return

		div.textContent = match[0].replace('<tool_call>', '').replace('</tool_call>', '').trim()

		el.replaceWith(div)
	})
}

// React-friendly observer (важно — subtree + childList)
const obs = new MutationObserver(() => scan())

obs.observe(document.documentElement, {
	childList: true,
	subtree: true,
})

// initial run with delay (важно для React mount)
setTimeout(scan, 500)
setTimeout(scan, 1500)
setTimeout(scan, 3000)
