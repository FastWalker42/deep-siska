const EXEC_SVG = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.4467 16.3769L20.2935 10.5476C21.1356 9.70811 21.5566 9.28836 21.7783 8.75458C22.0001 8.22081 22.0001 7.62719 22.0001 6.43996V5.87277C22.0001 4.04713 22.0001 3.13431 21.4312 2.56715C20.8624 2 19.9468 2 18.1157 2H17.5468C16.356 2 15.7606 2 15.2252 2.2211C14.6898 2.4422 14.2688 2.86195 13.4268 3.70146L7.57991 9.53078C6.59599 10.5117 5.98591 11.12 5.74966 11.7075C5.67502 11.8931 5.6377 12.0767 5.6377 12.2692C5.6377 13.0713 6.2851 13.7168 7.57991 15.0077L7.75393 15.1812L9.79245 13.1123C10.0832 12.8172 10.558 12.8137 10.8531 13.1044C11.1481 13.3951 11.1516 13.87 10.8609 14.1651L8.8162 16.2403L8.95326 16.3769C10.2481 17.6679 10.8955 18.3133 11.7 18.3133C11.8777 18.3133 12.0478 18.2818 12.2189 18.2188C12.8222 17.9966 13.438 17.3826 14.4467 16.3769Z" fill="currentColor"/>
</svg>
`

function addExecuteButton(block) {
	if (block.dataset.execInjected) return
	block.dataset.execInjected = '1'

	const container = block.querySelector('.efa13877')
	if (!container) return

	const btn = document.createElement('button')
	btn.className = 'ds-atom-button ds-text-button ds-text-button--with-icon'
	btn.style.marginLeft = '4px'

	btn.innerHTML = `
        <div class="ds-icon ds-atom-button__icon" style="font-size:16px;width:16px;height:16px;margin-right:3px;">
            ${EXEC_SVG}
        </div>
        <span>Execute</span>
    `

	btn.onclick = () => {
		const code = block.querySelector('pre')?.innerText
		if (!code) return

		window.postMessage(
			{
				type: 'EXEC_CODE',
				payload: code,
			},
			'*',
		)
	}

	container.appendChild(btn)
}

function scan() {
	document.querySelectorAll('.md-code-block').forEach(addExecuteButton)
}

const obs = new MutationObserver(scan)

obs.observe(document.documentElement, {
	childList: true,
	subtree: true,
})

setTimeout(scan, 500)
setTimeout(scan, 1500)
setTimeout(scan, 3000)
