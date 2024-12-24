import axios from 'axios';

const initData = window.Telegram.WebApp.initData;

const api = axios.create({
  baseURL: '', 
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `${ initData }`,
  },
})

export const get = async ( url ) => {
  try {
    const response = await api.get( url )
    console.log( 'response:', response.data )
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