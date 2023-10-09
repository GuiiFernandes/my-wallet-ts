import axios from 'axios';

const URL = 'https://economia.awesomeapi.com.br/json/all';

export const fetchAPI = async () => {
  const result = await axios.get(URL);
  return result.data;
};
