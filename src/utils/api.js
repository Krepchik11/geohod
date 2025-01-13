import axios from 'axios';

// const initData = window.Telegram.WebApp.initData;

const initData = window.Telegram?.WebApp?.initData || window.location.search;
const params = new URLSearchParams(initData);
const startAppParam = params.get('startapp');

if (startAppParam?.startsWith('registration_')) {
  const eventId = startAppParam.replace('registration_', '');
  router.push({ name: 'registration', params: { id: eventId } });
}


console.log( 'window.Telegram:', window.Telegram );
console.log( 'window.Telegram.WebApp:', window.Telegram.WebApp );
console.log( 'initData:', initData );
console.log('Parsed Params:', params);

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
    console.log( 'response:', response.data )
    return response.data
  } catch ( error ) {
    console.error( 'Ошибка при выполнении PATCH-запроса:', error.response || error )
    throw error;
  }
}

// export const deleteRequest = async ( url ) => {
//   try {
//     const response = await api.delete( url )
//     console.log( 'Удаление выполнено успешно:', response.data )
//     return response.data
//   } catch ( error ) {
//     console.error( 'Ошибка при выполнении DELETE-запроса:', error.response || error )
//     throw error
//   }
// }

