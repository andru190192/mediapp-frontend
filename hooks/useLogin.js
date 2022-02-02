import { useState, useEffect } from 'react';

export const useLogin = (localStorage) => {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log('useLogin', user)
    if(user !== null) setIsLogged(true);
  }, []);

  return { isLogged, setIsLogged };
}