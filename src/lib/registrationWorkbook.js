import ExcelJS from 'exceljs'
import { affiliationLabels, foodLabel, parkingLabel } from './registrationLabels.js'

const PURPLE = '593580'
const GOLD = 'B28A3F'
const HEADERS = [
  ['reg_number', 'Registration #'], ['full_name', 'Full name'], ['contact_number', 'Contact number'], ['category', 'Category'],
  ['nic_number', 'NIC'], ['food_preference', 'Food preference'], ['parking_inside', 'Parking requested'],
  ['vehicle_number', 'Vehicle number'], ['sliit_reg_number', 'SLIIT registration #'],
  ['faculty', 'Faculty'], ['year', 'Year'], ['is_rotaract_member', 'Rotaract member'],
  ['position', 'Member position'], ['membership_card_status', 'Membership card'],
  ['is_board_member', 'Board member'], ['board_member_name', 'Board member name'],
  ['board_member_position', 'Board member position'], ['board_member_contact', 'Board member contact'],
  ['mother_name', 'Mother name'], ['mother_nic', 'Mother NIC'], ['mother_contact', 'Mother contact'],
  ['father_name', 'Father name'], ['father_nic', 'Father NIC'], ['father_contact', 'Father contact'],
  ['affiliation', 'Affiliation'], ['club_or_org_name', 'Club / organization'],
  ['designation', 'Designation'], ['registered_at', 'Registered at'], ['attended', 'Checked in'],
  ['checked_in_at', 'Checked in at'],
]

function valueFor(row, key) {
  const value = row[key]
  if (key === 'food_preference') return foodLabel(value)
  if (key === 'parking_inside') return parkingLabel(value)
  if (key === 'affiliation') return affiliationLabels[value] || value || ''
  if (key === 'category') return value === 'sliit_member' ? 'SLIIT member' : 'Outsider'
  if (key === 'attended' || key === 'is_rotaract_member' || key === 'is_board_member') {
    return value == null ? '' : value ? 'Yes' : 'No'
  }
  if (key === 'registered_at' || key === 'checked_in_at') return value ? new Date(value) : ''
  return value ?? ''
}

function addList(workbook, name, rows, keys) {
  const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] })
  sheet.columns = keys.map((key) => ({ header: HEADERS.find(([field]) => field === key)[1], key, width: key.includes('name') || key === 'club_or_org_name' ? 28 : 21 }))
  sheet.getRow(1).height = 27
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${PURPLE}` } }
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.alignment = { vertical: 'middle' }
  })
  for (const row of rows) {
    const added = sheet.addRow(Object.fromEntries(keys.map((key) => [key, valueFor(row, key)])))
    added.eachCell((cell) => {
      cell.alignment = { vertical: 'middle' }
      if (added.number % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F4FA' } }
    })
    for (const key of ['registered_at', 'checked_in_at']) {
      const index = keys.indexOf(key)
      if (index !== -1) added.getCell(index + 1).numFmt = 'yyyy-mm-dd hh:mm'
    }
  }
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(rows.length + 1, 1), column: keys.length } }
  sheet.pageSetup = { fitToPage: true, fitToWidth: 1, fitToHeight: 0, orientation: 'landscape' }
}

export async function createRegistrationWorkbook(registrations) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Rotaract Club of SLIIT'
  workbook.created = new Date()
  const sliit = registrations.filter((row) => row.category === 'sliit_member')
  const outsiders = registrations.filter((row) => row.category === 'outside_sliit')
  const parking = registrations.filter((row) => row.parking_inside === true)

  const dashboard = workbook.addWorksheet('Dashboard')
  dashboard.columns = [{ width: 30 }, { width: 20 }, { width: 4 }, { width: 30 }, { width: 20 }]
  dashboard.mergeCells('A1:E2')
  const title = dashboard.getCell('A1')
  title.value = '14th Installation · Registration Dashboard'
  title.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } }
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${PURPLE}` } }
  title.alignment = { vertical: 'middle' }
  dashboard.getRow(1).height = 25
  dashboard.getRow(2).height = 25
  dashboard.getCell('A4').value = 'Exported at'
  dashboard.getCell('B4').value = new Date()
  dashboard.getCell('B4').numFmt = 'yyyy-mm-dd hh:mm'
  dashboard.getCell('A6').value = 'Registrations'
  dashboard.getCell('A7').value = 'Total registered'
  dashboard.getCell('B7').value = { formula: "COUNTA('SLIIT Members'!B:B)+COUNTA(Outsiders!B:B)-2", result: registrations.length }
  dashboard.getCell('A8').value = 'SLIIT members'
  dashboard.getCell('B8').value = { formula: "COUNTA('SLIIT Members'!B:B)-1", result: sliit.length }
  dashboard.getCell('A9').value = 'Outsiders'
  dashboard.getCell('B9').value = { formula: 'COUNTA(Outsiders!B:B)-1', result: outsiders.length }
  dashboard.getCell('A10').value = 'Parking requested'
  dashboard.getCell('B10').value = { formula: "COUNTA('Parking Requested'!B:B)-1", result: parking.length }
  dashboard.getCell('D6').value = 'Attendance & meals'
  dashboard.getCell('D7').value = 'Checked in'
  dashboard.getCell('E7').value = registrations.filter((row) => row.attended).length
  dashboard.getCell('D8').value = 'Not checked in'
  dashboard.getCell('E8').value = registrations.filter((row) => !row.attended).length
  dashboard.getCell('D9').value = 'Vegetarian'
  dashboard.getCell('E9').value = registrations.filter((row) => row.food_preference === 'veg').length
  dashboard.getCell('D10').value = 'Non-vegetarian'
  dashboard.getCell('E10').value = registrations.filter((row) => row.food_preference === 'non_veg').length
  for (const address of ['A6', 'D6']) {
    const cell = dashboard.getCell(address)
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${GOLD}` } }
  }
  for (const address of ['B7', 'B8', 'B9', 'B10', 'E7', 'E8', 'E9', 'E10']) {
    dashboard.getCell(address).font = { bold: true, size: 16, color: { argb: `FF${PURPLE}` } }
  }
  dashboard.getCell('A13').value = 'Counts reflect this export. Download again for current registrations.'
  dashboard.getCell('A13').font = { italic: true, color: { argb: 'FF766A7A' } }

  addList(workbook, 'SLIIT Members', sliit, HEADERS.map(([key]) => key))
  addList(workbook, 'Outsiders', outsiders, HEADERS.map(([key]) => key))
  addList(workbook, 'Parking Requested', parking, ['reg_number', 'full_name', 'contact_number', 'category', 'vehicle_number', 'nic_number', 'registered_at', 'attended'])
  const parkingSheet = workbook.getWorksheet('Parking Requested')
  return workbook.xlsx.writeBuffer()
}
