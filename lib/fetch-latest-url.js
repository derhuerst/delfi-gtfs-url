'use strict'

const fetch = require('node-fetch')
const {DateTime, IANAZone} = require('luxon')
const pkg = require('../package.json')

// With `HEAD` requests, cms.opendata-oepnv.de doesn't close the connection. 🙄
// todo: caching!
const checkZipUrl = async (url) => {
	const res = await fetch(url, {
		redirect: 'follow',
		timeout: 20 * 1000,
		headers: {
			'user-agent': pkg.homepage,
		},
	})

	if (res.status === 404) return false // not available
	if (
		res.status >= 200 && res.status <= 299 &&
		res.headers.get('content-type') === 'application/zip'
	) return true // available

	const err = new Error(res.ok ? 'unexpected response' : res.statusText)
	err.statusCode = res.status
	err.url = res.url
	err.res = res
	throw err
}

const zone = new IANAZone('Europe/Berlin')
const locale = 'de-DE'
const datesInBerlin = () => {
	let dt = DateTime.local()
	const next = () => {
		dt = dt.minus({days: 1})
		return {
			value: [dt.year, dt.month, dt.day],
			done: false,
		}
	}
	return {next}
}

const fetchLatestUrl = async () => {
	let dt = DateTime.fromMillis(Date.now(), {zone, locale})

	let attempts = 0
	while (attempts++ < 50) {
		dt = dt.minus({days: 1})
		const date = [
			dt.year,
			('0' + dt.month).slice(-2),
			('0' + dt.day).slice(-2),
		].join('')

		const url = `\
https://cms.opendata-oepnv.de/fileadmin/datasets/delfi/${date}_fahrplaene_gesamtdeutschland_gtfs.zip`
		if (await checkZipUrl(url)) return url
	}
	return null
}

module.exports = fetchLatestUrl
