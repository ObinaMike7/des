export const emptyProductForm = {
  item_number: '',
  name: '',
  description: '',
  quantity: '',
  price: '',
}

export const emptyEditProductForm = {
  id: '',
  name: '',
  description: '',
  quantity: '',
  price: '',
}

export const buildNewProductPayload = (formData) => ({
  item_number: formData.item_number.trim(),
  name: formData.name.trim(),
  description: formData.description.trim(),
  quantity: Number.parseInt(formData.quantity, 10),
  price: formData.price === '' ? null : Number.parseFloat(formData.price),
})

export const buildUpdatedProductPayload = (formData) => ({
  name: formData.name.trim(),
  description: formData.description.trim(),
  quantity: Number.parseInt(formData.quantity, 10),
  price: formData.price === '' ? null : Number.parseFloat(formData.price),
})

export const formatCurrency = (value) => {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return '$0.00'
  }

  return `$${amount.toFixed(2)}`
}
