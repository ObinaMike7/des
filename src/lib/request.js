const readJson = async (response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export const requestJson = async (url, options, fallbackMessage) => {
  const response = await fetch(url, options)
  const data = await readJson(response)

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage)
  }

  return data
}

