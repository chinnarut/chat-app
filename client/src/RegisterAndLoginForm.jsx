import React, { useContext, useState } from 'react';
import axios from "axios";
import { UserContext } from './UserContext';

const RegisterAndLoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");
  const {setUsername:setLogInUsername, setId} = useContext(UserContext);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login"

    try {
      const { data } = await axios.post( `/${url}`, {
        username: username,
        password: password
      });

      setLogInUsername(username);
      setId(data.id);
      
    } catch(err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          type="text" 
          placeholder="username" 
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input 
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password" 
          placeholder="password" 
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "register" && (
            <div>
              Already a member?
              <button onClick={() => setIsLoginOrRegister("login")}>
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === "login" && (
            <div>
              Have an account?
              <button onClick={() => setIsLoginOrRegister("register")}>
                Register!
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default RegisterAndLoginForm
