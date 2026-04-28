import { supabase } from './supabase'

export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const addProduct = async (product) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data[0]
}

export const updateProduct = async (productId, product) => {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', productId)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data[0]
}

export const deleteProduct = async (productId) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    throw new Error(error.message)
  }

  return { id: productId }
}
