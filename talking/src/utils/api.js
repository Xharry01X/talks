 const API_KEY = 'wys_YMaL6zUeqo1JTogaaPEO1X9cSnzNdW3wNNZG';
 const API_BASE_URL = 'https://ad6eac20e88649a6a1af3eed83e2b50e.weavy.io/api';


 export async function sendMessage(chatId, userId, message){
  try {
    let body = {
        text : message,
        metadata: {userId: userId}
    }

    let response = await fetch(`${API_BASE_URL}`)
  } catch (error) {
    
  }
 }
