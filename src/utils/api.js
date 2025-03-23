import axios from 'axios';

const initData = window.Telegram.WebApp.initData

const api = axios.create({
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `${ initData }`,
  },
})

export const get = async ( url ) => {
  try {
    const response = await api.get( url )
    return response.data
  } catch ( error ) {
    console.error( 'Ошибка при выполнении GET-запроса:', error.response || error )
    throw error
  }
}

export const post = async ( url, data ) => {
  try {
    const response = await api.post( url, data )
    return response.data
  } catch ( error ) {
    console.error( 'Ошибка при выполнении POST-запроса:', error.response || error )
    throw error
  }
}

export const put = async ( url, data ) => {
  try {
    const response = await api.put( url, data )
    return response.data
  } catch ( error ) {
    console.error( 'Ошибка при выполнении PUT-запроса:', error.response || error )
    throw error
  }
}

export const patch = async ( url, data ) => {
  try {
    const response = await api.patch( url, data )
    return response.data
  } catch ( error ) {
    console.error( 'Ошибка при выполнении PATCH-запроса:', error.response || error )
    throw error;
  }
}

export const del = async ( url ) => {
  try {
    const response = await api.delete ( url )
    return response.data
  } catch ( error ) {
    console.error( 'Ошибка при выполнении DELETE-запроса:', error.response || error )
    throw error
  }
}
