export const affiliationLabels = {
  rotary: 'Rotary',
  district_exec_committee: 'District Executive Committee',
  district_steering_committee: 'District Steering Committee',
  rotaract: 'Rotaract',
  interact: 'Interact',
  non_rotaract: 'Non-Rotaract',
}

export const foodLabel = (value) => ({ veg: 'Vegetarian', non_veg: 'Non-vegetarian' }[value] || value || 'Not provided')
export const parkingLabel = (value) => value === true ? 'Yes' : value === false ? 'No' : 'Not provided'
export const dateLabel = (value) => value ? new Date(value).toLocaleString() : '—'
