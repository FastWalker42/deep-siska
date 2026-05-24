import { $ } from 'bun'

const PORT = 8080

const server = Bun.serve({
	port: PORT,

	async fetch(req) {
		// =====================================================
		// CORS
		// =====================================================

		if (req.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			})
		}

		// =====================================================
		// ONLY POST
		// =====================================================

		if (req.method !== 'POST') {
			return Response.json(
				{
					error: 'POST only',
				},
				{
					status: 405,
				},
			)
		}

		try {
			const command = await req.text()

			console.log('\n========================')
			console.log('[tool_call]')
			console.log(command)
			console.log('========================\n')

			const result = await $`bash -c ${command}`.quiet().nothrow()

			const stdout = result.stdout.toString()

			const stderr = result.stderr.toString()

			const output = (stdout + '\n' + stderr).trim()

			console.log('[exit]', result.exitCode)

			if (output) {
				console.log(output.slice(0, 1000))
			}

			return Response.json(
				{
					success: result.exitCode === 0,
					exitCode: result.exitCode,
					output: output || '(no output)',
				},
				{
					headers: {
						'Access-Control-Allow-Origin': '*',
					},
				},
			)
		} catch (err) {
			console.error(err)

			return Response.json(
				{
					success: false,
					error: String(err),
				},
				{
					status: 500,
					headers: {
						'Access-Control-Allow-Origin': '*',
					},
				},
			)
		}
	},
})

console.log(`
╔══════════════════════════════╗
║      TOOL BRIDGE ACTIVE      ║
╠══════════════════════════════╣
║  http://localhost:${PORT}        ║
╚══════════════════════════════╝
`)
