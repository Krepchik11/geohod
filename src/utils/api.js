import axios from 'axios';
import crypto from 'crypto';


function validateInitData(initData, botToken) {
  const urlSearchParams = new URLSearchParams(initData);
  const data = Object.fromEntries(urlSearchParams.entries());

  console.log('data:', data);
  


  const checkString = Object.keys(data)
    .filter((key) => key !== 'hash')
    .map((key) => `${key}=${data[key]}`)
    .sort()
    .join('\n');

  console.log('checkString:', checkString);
  
    

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

  console.log('secretKey:', secretKey);

  const signature = crypto.createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  console.log('signature:', signature);

  console.log('СОВПАДАЮТ?:', data.hash === signature);

  return data.hash === signature;
}


const initData = window.Telegram.WebApp.initData;
const botToken = '7743241154:AAHtg7ipMzF8DjRnZQTBtR49uUIDj3zBe1w';

if (!initData) {
  console.error('initData отсутствует в URL');
  throw new Error('initData отсутствует');
}

if (!validateInitData(initData, botToken)) {
  console.error('Ошибка: initData не прошло проверку!');
  throw new Error('Неверные данные инициализации!');
}

console.log('initData успешно проверено!');

const api = axios.create({
  baseURL: '', 
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${initData}`, 
  },
});


export const get = async (url) => {
  try {
    const response = await api.get(url);
    console.log('response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при выполнении GET-запроса:', error.response || error);
    throw error;
  }
};


export const post = async (url, data) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при выполнении POST-запроса:', error.response || error);
    throw error;
  }
};






// import axios from 'axios'

// // const urlParams = new URLSearchParams( window.location.search )
// // const initData = urlParams.get( 'initData' )

// const initData = window.Telegram.WebApp.initData

// console.log('initData:', initData);

// if ( !initData ) {
//   console.error( 'initData отсутствует в URL' )
// }

// const api = axios.create({
//   baseURL: '', 
//   headers: {
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${initData}`, 
//   },
// })



// export const get = async (url) => {
//   try {
//     const response = await api.get(url);
//     console.log('response:', response.data);
    
//     return response.data;
//   } catch (error) {
//     console.error('Ошибка при выполнении GET-запроса:', error.response || error);
//     throw error;
//   }
// }

// export const post = async (url, data) => {
//   try {
//     const response = await api.post(url, data);
//     return response.data;
//   } catch (error) {
//     console.error('Ошибка при выполнении POST-запроса:', error.response || error);
//     throw error;
//   }
// };
