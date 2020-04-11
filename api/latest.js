'use strict'

const {promisify} = require('util')
const createCors = require('cors')
const fetchLatestUrl = require('../lib/fetch-latest-url')

const cors = promisify(createCors())

const latestDelfiGtfsUrl = async (req, res) => {
	await cors(req, res)
	if (res.headersSent) return;

	res.setHeader('content-type', 'text-plain')

	const url = await fetchLatestUrl()
	if (url) {
		res.status(302)
		res.setHeader('location', url)
		res.end(url)
	} else {
		res.status(404)
		res.end('failed to determine the latest valid URL')
	}
}

module.exports = latestDelfiGtfsUrl
