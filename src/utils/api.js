import axios from 'axios'

// const urlParams = new URLSearchParams( window.location.search )
// const initData = urlParams.get( 'initData' )

const initData = window.Telegram.WebApp.initData

console.log('initData:', initData);




if ( !initData ) {
  console.error( 'initData отсутствует в URL' )
}

const api = axios.create({
  baseURL: '', 
  headers: {
    'Content-Type': 'application/json',
    Authorization: initData || '', 
  },
})

export const get = async (url) => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Ошибка при выполнении GET-запроса:', error.response || error);
    throw error;
  }
}

export const post = async (url, data) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при выполнении POST-запроса:', error.response || error);
    throw error;
  }
};
