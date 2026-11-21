import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { readFile } from 'node:fs/promises'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server
let NicSearchTab
let RegistrationsTable
let searchByNic

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  ;({ default: NicSearchTab, searchByNic } = await server.ssrLoadModule('/src/components/NicSearchTab.jsx'))
  ;({ default: RegistrationsTable } = await server.ssrLoadModule('/src/components/RegistrationsTable.jsx'))
})
after(async () => { await server?.close() })

const registrations = [
  { id: 1, full_name: 'Asha', reg_number: 101, nic_number: '123456789V', attended: false, mother_nic: '765432109V' },
  { id: 2, full_name: 'Nimal', reg_number: 102, nic_number: '200012345678', attended: true },
  { id: 3, full_name: 'Guest', reg_number: 103, nic_number: null, attended: false },
]

test('searches attendee NIC by partial text, ignoring case and surrounding spaces', () => {
  assert.deepEqual(searchByNic(registrations, '  789v '), [registrations[0]])
  assert.deepEqual(searchByNic(registrations, '2000'), [registrations[1]])
})

test('does not match parent NICs or show results for empty input', () => {
  assert.deepEqual(searchByNic(registrations, '765432109V'), [])
  assert.deepEqual(searchByNic(registrations, '  '), [])
})

test('renders an identified NIC search field and selectable attendee results', () => {
  const html = renderToStaticMarkup(createElement(NicSearchTab, { registrations, onSelect() {} }))
  assert.match(html, /aria-label="Search attendees by NIC"/)
  assert.match(html, /type="text"/)
})

test('shows each attendee NIC in the admin registrations table', () => {
  const html = renderToStaticMarkup(createElement(RegistrationsTable, { registrations, onSelect() {} }))
  assert.match(html, /<th>NIC<\/th>/)
  assert.match(html, /data-label="NIC">123456789V<\/td>/)
  assert.match(html, /data-label="NIC">200012345678<\/td>/)
  assert.match(html, /data-label="NIC">Not provided<\/td>/)
})

test('makes NIC lookup a separate admin check-in method', async () => {
  const dashboard = await readFile(new URL('../src/pages/AdminDashboard.jsx', import.meta.url), 'utf8')
  assert.match(dashboard, /label: 'Search by NIC'/)
  assert.match(dashboard, /TAB_KEYS = \[[^\]]*'nic'/)
  assert.match(dashboard, /tab === 'nic' && <NicSearchTab registrations=\{registrations\} onSelect=\{handleSelect\}/)
})
