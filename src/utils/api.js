import axios from 'axios'

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer 7686811149:AAG0SNhXi5SGRQF15yzq4bfmfcRDhbY03uU`  Сергея
    'Authorization': `5965981285:AAHE-YMoEm2Tly-QwyRcAjh291Z6TfCueNw`
  },
})

export const get = async ( url ) => {
  try {
    const response = await api.get( url )
    return response.data
  } catch ( error ) {
    console.error( "API error:", error )
    throw error
  }
}

export const post = async ( url, data ) => {
  try {
    const response = await api.post( url, data )
    return response.data
  } catch ( error ) {
    console.error( "API error:", error )
    throw error
  }
}
